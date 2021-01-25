'use strict';
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

const uploadAsJSON = async (username, establishmentId, content, key) => {
  try {
    await s3
      .putObject({
        Bucket,
        Key: key,
        Body: JSON.stringify(content, null, 2),
        ContentType: 'application/json',
        Metadata: {
          username,
          establishmentId: String(establishmentId),
        },
      })
      .promise();
  } catch (err) {
    console.error('uploadAsJSON: ', err);
    throw new Error(`Failed to upload S3 object: ${key}`);
  }
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

const purgeBulkUploadS3Objects = async (establishmentId) => {
  const listParams = params(establishmentId);

  const latestObjects = await s3.listObjects(listParams).promise();
  const deleteKeys = [];

  latestObjects.Contents.forEach((myFile) => {
    const ignoreRoot = /.*\/$/;
    if (!ignoreRoot.test(myFile.Key)) {
      deleteKeys.push({
        Key: myFile.Key,
      });
    }
  });

  listParams.Prefix = `${establishmentId}/intermediary/`;
  const intermediaryObjects = await s3.listObjects(listParams).promise();
  intermediaryObjects.Contents.forEach((myFile) => {
    deleteKeys.push({
      Key: myFile.Key,
    });
  });

  listParams.Prefix = `${establishmentId}/validation/`;
  const validationObjects = await s3.listObjects(listParams).promise();
  validationObjects.Contents.forEach((myFile) => {
    deleteKeys.push({
      Key: myFile.Key,
    });
  });

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

module.exports = {
  s3,
  Bucket,
  uploadAsJSON,
  saveResponse,
  downloadContent,
  purgeBulkUploadS3Objects,
  deleteFilesS3,
  findFilesS3,
};
