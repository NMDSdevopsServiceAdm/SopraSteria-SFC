'use strict';
const moment = require('moment');
const config = require('../../../config/config');
const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

const params = (establishmentId) => {
  return {
    Bucket,
    Prefix: `${establishmentId}/latest/`,
  };
};

const disbursementBucket = String(config.get('disbursement.bucketname'));

const uploadDisbursementFileToS3 = async (
  buffer,
  bucket = disbursementBucket,
  fileName = moment().format('DD-MM-YYYY hh:mm:ss') + '-fundingClaimForm.xlsx',
) => {
  try {
    await s3
      .putObject({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
      })
      .promise();
  } catch (err) {
    console.error('uploadDataToS3: ', err);
    throw new Error('Failed to upload To S3 ');
  }
};

const uploadJSONDataToS3 = async (username, establishmentId, content, key) => {
  try {
    await s3
      .putObject({
        Bucket,
        Key: `${establishmentId}/${key}.json`,
        Body: JSON.stringify(content, null, 2),
        ContentType: 'application/json',
        Metadata: {
          username,
          establishmentId: String(establishmentId),
        },
      })
      .promise();
  } catch (err) {
    console.error('uploadDataToS3: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
};

const uploadMetadataToS3 = async (username, establishmentId, establishments, workers, training) => {
  const promises = [
    uploadJSONDataToS3(
      username,
      establishmentId,
      establishments.metadata,
      `latest/${establishments.metadata.filename}.metadata`,
    ),
    uploadJSONDataToS3(username, establishmentId, workers.metadata, `latest/${workers.metadata.filename}.metadata`),
  ];

  if (training.imported) {
    promises.push(
      uploadJSONDataToS3(username, establishmentId, training.metadata, `latest/${training.metadata.filename}.metadata`),
    );
  }

  await Promise.all(promises);
};

const uploadValidationDataToS3 = async (
  username,
  establishmentId,
  csvEstablishmentSchemaErrors,
  csvWorkerSchemaErrors,
  csvTrainingSchemaErrors,
) => {
  await Promise.all([
    uploadJSONDataToS3(username, establishmentId, csvEstablishmentSchemaErrors, 'validation/establishments.validation'),
    uploadJSONDataToS3(username, establishmentId, csvWorkerSchemaErrors, 'validation/workers.validation'),
    uploadJSONDataToS3(username, establishmentId, csvTrainingSchemaErrors, 'validation/training.validation'),
  ]);
};

const uploadDifferenceReportToS3 = async (username, establishmentId, report) => {
  await uploadJSONDataToS3(username, establishmentId, report, 'validation/difference.report');
};

const uploadEntitiesToS3 = async (username, establishmentId, establishmentsOnlyForJson) => {
  await uploadJSONDataToS3(username, establishmentId, establishmentsOnlyForJson, 'intermediary/all.entities');
};

const uploadUniqueLocalAuthoritiesToS3 = async (username, establishmentId, uniqueLocalAuthorities) => {
  await uploadJSONDataToS3(username, establishmentId, uniqueLocalAuthorities, 'intermediary/all.localauthorities');
};

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }

  return s3
    .putObject({
      Bucket,
      Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
      Body: JSON.stringify({
        url: req.url,
        startTime: req.startTime,
        endTime: new Date().toISOString(),
        responseCode: statusCode,
        responseBody: body,
        responseHeaders: typeof headers === 'object' ? headers : undefined,
      }),
    })
    .promise();
};

const downloadContent = async (key, size, lastModified) => {
  try {
    const filenameRegex = /^(.+\/)*(.+)\.(.+)$/;
    return await s3
      .getObject({
        Bucket,
        Key: key,
      })
      .promise()
      .then((objData) => ({
        key,
        data: objData.Body.toString(),
        filename: key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3],
        username: objData.Metadata.username,
        size,
        lastModified,
      }));
  } catch (err) {
    console.error(`api/establishment/bulkupload/downloadFile: ${key})\n`, err);
    throw new Error(`Failed to download S3 object: ${key}`);
  }
};

const saveLastBulkUpload = async (establishmentId) => {
  const listParams = params(establishmentId);
  listParams.Prefix = `${establishmentId}/lastBulkUpload/`;

  const existingFiles = await getKeysFromFolder(listParams);
  if (existingFiles.length > 0) {
    const deleteParams = {
      Bucket,
      Delete: {
        Objects: existingFiles,
        Quiet: true,
      },
    };

    await s3.deleteObjects(deleteParams).promise();
  }

  const originFolder = `${establishmentId}/latest/`;
  const destinationFolder = `${establishmentId}/lastBulkUpload/`;

  await moveFolders(originFolder, destinationFolder);
};
const purgeBulkUploadS3Objects = async (establishmentId) => {
  const listParams = params(establishmentId);
  let deleteKeys = [];

  const deleteParams = {
    Bucket,
    Delete: {
      Objects: [],
      Quiet: true,
    },
  };

  listParams.Prefix = `${establishmentId}/latest/`;
  deleteKeys = deleteKeys.concat(await getKeysFromFolder(listParams));

  listParams.Prefix = `${establishmentId}/validation/`;
  deleteKeys = deleteKeys.concat(await getKeysFromFolder(listParams));

  listParams.Prefix = `${establishmentId}/intermediary/`;
  deleteKeys = deleteKeys.concat(await getKeysFromFolder(listParams));

  deleteParams.Delete.Objects = deleteKeys;

  if (deleteKeys.length > 0) {
    await s3.deleteObjects(deleteParams).promise();
  }
};

const moveFolders = async (folderToMove, destinationFolder) => {
  try {
    const listObjectsResponse = await s3
      .listObjects({
        Bucket,
        Prefix: folderToMove,
        Delimiter: '/',
      })
      .promise();

    const folderContentInfo = listObjectsResponse.Contents;
    const folderPrefix = listObjectsResponse.Prefix;

    await Promise.all(
      folderContentInfo.map(async (fileInfo) => {
        const ignoreRoot = /.*\/$/;
        if (!ignoreRoot.test(fileInfo.Key)) {
          await s3
            .copyObject({
              Bucket,
              CopySource: `${Bucket}/${fileInfo.Key}`, // old file Key
              Key: `${destinationFolder}${fileInfo.Key.replace(folderPrefix, '')}`, // new file Key
            })
            .promise();
        }
      }),
    );
  } catch (err) {
    console.error(err);
  }
};
const getKeysFromFolder = async (listParams) => {
  const results = [];

  const filesInFolder = await s3.listObjects(listParams).promise();
  filesInFolder.Contents.forEach((myFile) => {
    const ignoreRoot = /.*\/$/;
    if (!ignoreRoot.test(myFile.Key)) {
      results.push({
        Key: myFile.Key,
      });
    }
  });
  return results;
};
const listMetaData = async (establishmentId, folder) => {
  const findMetaDataObjects = /.*metadata.json$/;
  const toDownload = [];

  folder = folder[0] !== '/' ? '/' + folder : folder;
  const listParams = {
    Bucket,
    Prefix: `${establishmentId}${folder}`,
  };
  const filesInFolder = await s3.listObjects(listParams).promise();
  filesInFolder.Contents.forEach(async (myFile) => {
    if (findMetaDataObjects.test(myFile.Key)) {
      toDownload.push(downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
    }
  });

  const allMetaFiles = await Promise.all(toDownload);

  return allMetaFiles.map((file) => {
    file.data = JSON.parse(file.data);
    file.data.key = file.key.replace('.metadata.json', '');
    return file;
  });
};

const findFilesS3 = async (establishmentId, fileName) => {
  const listParams = params(establishmentId);
  const latestObjects = await s3.listObjects(listParams).promise();
  const foundFiles = [];

  latestObjects.Contents.forEach(async (myFile) => {
    const ignoreRoot = /.*\/$/;
    if (!ignoreRoot.test(myFile.Key) && myFile.Key.includes(fileName)) {
      foundFiles.push({
        Key: myFile.Key,
      });
    }
  });
  return foundFiles;
};

const deleteFilesS3 = async (establishmentId, fileName) => {
  const deleteKeys = await findFilesS3(establishmentId, fileName);

  if (deleteKeys.length > 0) {
    await s3
      .deleteObjects({
        Bucket,
        Delete: {
          Objects: deleteKeys,
          Quiet: true,
        },
      })
      .promise();
  }
};

const listObjectsInBucket = async (establishmentId) => {
  return await s3
    .listObjects({
      Bucket,
      Prefix: `${establishmentId}/latest/`,
    })
    .promise();
};

module.exports = {
  s3,
  Bucket,
  uploadJSONDataToS3,
  uploadMetadataToS3,
  uploadValidationDataToS3,
  uploadDifferenceReportToS3,
  uploadEntitiesToS3,
  uploadUniqueLocalAuthoritiesToS3,
  saveResponse,
  saveLastBulkUpload,
  downloadContent,
  purgeBulkUploadS3Objects,
  deleteFilesS3,
  findFilesS3,
  listMetaData,
  listObjectsInBucket,
  uploadDisbursementFileToS3,
};
