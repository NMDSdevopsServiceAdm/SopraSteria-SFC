'use strict';
const moment = require('moment');
const config = require('../../../config/config');

const s3ClientV3 = require('./s3clientv3');

const Bucket = String(config.get('bulkupload.bucketname'));

const params = (establishmentId) => {
  return {
    Bucket,
    Prefix: `${establishmentId}/latest/`,
  };
};

const disbursementBucket = String(config.get('disbursement.bucketname'));

const uploadDisbursementFileToS3 = async (buffer) => {
  try {
    await s3ClientV3.putObject({
      Bucket: disbursementBucket,
      Key: moment().format('DD-MM-YYYY hh:mm:ss') + '-fundingClaimForm.xlsx',
      Body: buffer,
    });
  } catch (err) {
    console.error('uploadDataToS3: ', err);
    throw new Error('Failed to upload To S3 ');
  }
};

const uploadJSONDataToS3 = async (username, establishmentId, content, key) => {
  try {
    await s3ClientV3.putObject({
      Bucket,
      Key: `${establishmentId}/${key}.json`,
      Body: JSON.stringify(content, null, 2),
      ContentType: 'application/json',
      Metadata: {
        username,
        establishmentId: String(establishmentId),
      },
    });
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

  return s3ClientV3.putObject({
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
  });
};

const downloadObjectAsString = async (key) => {
  const getObjectResult = await s3ClientV3.getObject({
    Bucket,
    Key: key,
  });

  return getObjectResult.Body.transformToString();
};

const downloadContent = async (key, size, lastModified) => {
  try {
    const filenameRegex = /^(.+\/)*(.+)\.(.+)$/;

    const getObjectResult = await s3ClientV3.getObject({
      Bucket,
      Key: key,
    });
    const data = await getObjectResult.Body.transformToString();

    const returnObject = {
      key,
      data,
      filename: key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3],
      username: getObjectResult.Metadata.username,
      size,
      lastModified,
    };
    return returnObject;
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

    await s3ClientV3.deleteObjects(deleteParams);
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

  if (deleteKeys.length > 0) {
    if (deleteKeys.length < 1000) {
      deleteParams.Delete.Objects = deleteKeys;
      await s3ClientV3.deleteObjects(deleteParams);
    } else {
      const noOfFiles = 1000;
      for (let i = 0; i < deleteKeys.length; i += noOfFiles) {
        const fileKeys = deleteKeys.slice(i, i + noOfFiles);
        deleteParams.Delete.Objects = fileKeys;
        await s3ClientV3.deleteObjects(deleteParams);
      }
    }
  }
};

const moveFolders = async (folderToMove, destinationFolder) => {
  try {
    const listObjectsResponse = await s3ClientV3.listObjects({
      Bucket,
      Prefix: folderToMove,
      Delimiter: '/',
    });

    const folderContentInfo = listObjectsResponse.Contents ?? [];
    const folderPrefix = listObjectsResponse.Prefix ?? folderToMove ?? '';

    await Promise.all(
      folderContentInfo.map(async (fileInfo) => {
        const ignoreRoot = /.*\/$/;
        if (!ignoreRoot.test(fileInfo.Key)) {
          await s3ClientV3.copyObject({
            Bucket,
            CopySource: `${Bucket}/${fileInfo.Key}`, // old file Key
            Key: `${destinationFolder}${fileInfo.Key.replace(folderPrefix, '')}`, // new file Key
          });
        }
      }),
    );
  } catch (err) {
    console.error(err);
  }
};
const getKeysFromFolder = async (listParams) => {
  const results = [];

  const filesInFolder = await s3ClientV3.listObjects(listParams);
  if (!filesInFolder?.Contents) {
    return [];
  }

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

  const filesInFolder = await s3ClientV3.listObjects(listParams);
  if (!filesInFolder?.Contents) {
    return [];
  }

  const filesToDownload = filesInFolder.Contents.filter((file) => findMetaDataObjects.test(file.Key)).map((file) =>
    downloadContent(file.Key, file.Size, file.LastModified),
  );

  const allMetaFiles = await Promise.all(filesToDownload);

  return allMetaFiles.map((file) => {
    file.data = JSON.parse(file.data);
    file.data.key = file.key.replace('.metadata.json', '');
    return file;
  });
};

const findFilesS3 = async (establishmentId, fileName) => {
  const listParams = params(establishmentId);
  const latestObjects = await s3ClientV3.listObjects(listParams);
  const foundFiles = [];

  if (!latestObjects?.Contents) {
    return [];
  }

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
    await s3ClientV3.deleteObjects({
      Bucket,
      Delete: {
        Objects: deleteKeys,
        Quiet: true,
      },
    });
  }
};

const listLatestObjectsInWorkplaceBucket = async (establishmentId) => {
  return s3ClientV3.listObjects({
    Bucket,
    Prefix: `${establishmentId}/latest/`,
  });
};

const headObjectInBucket = async (fileKey) => {
  return s3ClientV3.headObject({
    Bucket,
    Key: fileKey,
  });
};

const getSignedUrlForUpload = async ({ ...args }) => {
  const expiresIn = config.get('bulkupload.uploadSignedUrlExpire');
  const options = { expiresIn };

  const params = {
    Bucket,
    ...args,
  };

  const signedUrl = await s3ClientV3.getSignedUrlForPutObject({ ...params, options });

  return signedUrl;
};

module.exports = {
  s3ClientV3,
  bulkUploadBucket: Bucket,
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
  listLatestObjectsInWorkplaceBucket,
  uploadDisbursementFileToS3,
  getKeysFromFolder,
  headObjectInBucket,
  getSignedUrlForUpload,
  downloadObjectAsString,
};
