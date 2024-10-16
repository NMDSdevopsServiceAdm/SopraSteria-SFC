const { v4: uuidv4 } = require('uuid');

const config = require('../../../config/config');
const models = require('../../../models');

const s3 = require('./s3');

const certificateBucket = String(config.get('workerCertificate.bucketname'));
const uploadSignedUrlExpire = config.get('workerCertificate.uploadSignedUrlExpire');
const downloadSignedUrlExpire = config.get('workerCertificate.downloadSignedUrlExpire');
const HttpError = require('../../../utils/errors/httpError');

class WorkerCertificateService {
  certificatesModel;
  certificateTypeModel;
  recordType;

  static initialiseQualifications = () => {
    const service = new WorkerCertificateService();
    service.certificatesModel = models.qualificationCertificates;
    service.certificateTypeModel = models.workerQualifications;
    service.recordType = 'qualification';
    return service;
  }

  static initialiseTraining = () => {
    const service = new WorkerCertificateService();
    service.certificatesModel = models.trainingCertificates;
    service.certificateTypeModel = models.workerTraining;
    service.recordType = 'training';
    return service;
  }

  constructor() {
  }

  makeFileKey = (establishmentUid, workerId, recordUid, fileId) => {
    return `${establishmentUid}/${workerId}/${this.recordType}Certificate/${recordUid}/${fileId}`;
  };

  async requestUploadUrl({files, params}) {
    const { id, workerId, recordUid } = params;
    if (!files || !files.length) {
      throw new HttpError('Missing `files` param in request body', 400);
    }

    if (!files.every((file) => file?.filename)) {
      throw new HttpError('Missing file name in request body', 400);
    }

    const responsePayload = [];

    for (const file of files) {
      const filename = file.filename;
      const fileId = uuidv4();
      const key = this.makeFileKey(id, workerId, recordUid, fileId);
      const signedUrl = await s3.getSignedUrlForUpload({
        bucket: certificateBucket,
        key,
        options: { expiresIn: uploadSignedUrlExpire },
      });
      responsePayload.push({ filename, signedUrl, fileId, key });
    }

    return responsePayload;
  };

  async confirmUpload(req) {
    const { establishmentId, files } = req;
    const { recordUid } = req.params;

    if (!files || !files.length) {
      throw new HttpError('Missing `files` param in request body', 400);
    }

    const record = await this.certificateTypeModel.findOne({
      where: {
        uid: recordUid,
      },
      attributes: ['id', 'workerFk'],
    });

    if (!record) {
      throw new HttpError(`Failed to find related ${this.recordType} record`, 400);
    }

    const { workerFk, id } = record.dataValues;

    const etagsMatchRecord = await this.verifyEtagsForAllFiles(establishmentId, files);
    if (!etagsMatchRecord) {
      throw new HttpError('Failed to verify files on S3', 400);
    }

    for (const file of files) {
      const { filename, fileId, key } = file;

      try {
        await this.certificatesModel.addCertificate({ id, workerFk, filename, fileId, key });
      } catch (err) {
        throw new HttpError('Failed to add records to database', 500);
      }
    }
  };

  verifyEtagsForAllFiles = async (establishmentId, files) => {
    try {
      for (const file of files) {
        const etagMatchS3Record = await s3.verifyEtag(certificateBucket, file.key, file.etag);
        if (!etagMatchS3Record) {
          console.error('Etags in the request does not match the record at AWS bucket');
          return false;
        }
      }
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  };

  async getPresignedUrlForCertificateDownload ({files, params}) {
    const { id, workerId, recordUid } = params;

    if (!files || !files.length) {
      throw new HttpError('No files provided in request body', 400);
    }

    const responsePayload = [];

    for (const file of files) {
      const signedUrl = await s3.getSignedUrlForDownload({
        bucket: certificateBucket,
        key: this.makeFileKey(id, workerId, recordUid, file.uid),
        options: { expiresIn: downloadSignedUrlExpire },
      });
      responsePayload.push({ signedUrl, filename: file.filename });
    }

    return { files: responsePayload };
  };

  deleteRecordsFromDatabase = async (uids) => {
    try {
      await this.certificatesModel.deleteCertificate(uids);
      return true;
    } catch (error) {
      return false;
    }
  };

  deleteCertificatesFromS3 = async (filesToDeleteFromS3) => {
    const deleteFromS3Response = await s3.deleteCertificatesFromS3({
      bucket: certificateBucket,
      objects: filesToDeleteFromS3,
    });

    if (deleteFromS3Response?.Errors?.length > 0) {
      console.error(JSON.stringify(deleteFromS3Response.Errors));
    }
  };

  async deleteCertificates(req) {
    const { files } = req;
    const { id, workerId, recordUid } = req.params;

    if (!files || !files.length) {
      throw new HttpError('No files provided in request body', 400);
    }

    let filesToDeleteFromS3 = [];
    let filesToDeleteFromDatabase = [];

    for (const file of files) {
      let fileKey = this.makeFileKey(id, workerId, recordUid, file.uid);

      filesToDeleteFromDatabase.push(file.uid);
      filesToDeleteFromS3.push({ Key: fileKey });
    }

    try {
      const noOfFilesFoundInDatabase = await this.certificatesModel.countCertificatesToBeDeleted(
        filesToDeleteFromDatabase,
      );

      if (noOfFilesFoundInDatabase !== filesToDeleteFromDatabase.length) {
        throw new HttpError('Invalid request', 400);
      }

      const deletionFromDatabase = await this.deleteRecordsFromDatabase(filesToDeleteFromDatabase);
      if (!deletionFromDatabase) {
        throw new HttpError(undefined, 500);
      }
    } catch (error) {
      if (error.statusCode !== undefined) {
        throw error;
      }
      throw new HttpError(undefined, 500);
    }

    await this.deleteCertificatesFromS3(filesToDeleteFromS3);
  };
}

module.exports = WorkerCertificateService;