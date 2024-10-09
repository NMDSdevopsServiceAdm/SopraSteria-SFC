const { v4: uuidv4 } = require('uuid');

const config = require('../../../config/config');
const models = require('../../../models');

const s3 = require('./s3');

const certificateBucket = String(config.get('workerCertificate.bucketname'));
const uploadSignedUrlExpire = config.get('workerCertificate.uploadSignedUrlExpire');
const downloadSignedUrlExpire = config.get('workerCertificate.downloadSignedUrlExpire');
const HttpError = require('../../../utils/errors/httpError');

export class WorkerCertificateService {
  certificatesModel;
  certificateTypeModel;
  recordType;

  constructor(certificatesModel, certificateTypeModel, certificateType) {
    this.certificatesModel = certificatesModel;
    this.certificateTypeModel = certificateTypeModel;
    this.recordType = this.recordType;
  }

  makeFileKey = (establishmentUid, workerId, recordUid, fileId) => {
    return `${establishmentUid}/${workerId}/${this.recordType}Certificate/${recordUid}/${fileId}`;
  };

  requestUploadUrl = async ({files, params}) => {
    const { files } = body;
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
      const key = makeFileKey(id, workerId, recordUid, fileId);
      const signedUrl = await s3.getSignedUrlForUpload({
        bucket: certificateBucket,
        key,
        options: { expiresIn: uploadSignedUrlExpire },
      });
      responsePayload.push({ filename, signedUrl, fileId, key });
    }

    return { files: responsePayload };
  };

  confirmUpload = async (req) => {
    const { establishmentId } = req;
    const { recordUid } = req.params;
    const { files } = req.body;

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
      throw new HttpError(`Failed to find related ${recordType} record`, 400);
    }

    const { workerFk, id } = record.dataValues;

    const etagsMatchRecord = await verifyEtagsForAllFiles(establishmentId, files);
    if (!etagsMatchRecord) {
      throw new HttpError('Failed to verify files on S3', 400);
    }

    for (const file of files) {
      const { filename, fileId, key } = file;

      try {
        await this.certificatesModel.addCertificate({ id, workerFk, filename, fileId, key });
      } catch (err) {
        console.error(err);
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

  getPresignedUrlForCertificateDownload = async ({files, params}) => {
    const { id, workerId, recordUid } = params;

    if (!files || !files.length) {
      return res.status(400).send('No files provided in request body');
    }

    const responsePayload = [];

    for (const file of files) {
      const signedUrl = await s3.getSignedUrlForDownload({
        bucket: certificateBucket,
        key: makeFileKey(id, workerId, recordUid, file.uid),
        options: { expiresIn: downloadSignedUrlExpire },
      });
      responsePayload.push({ signedUrl, filename: file.filename });
    }

    return responsePayload;
  };

  deleteRecordsFromDatabase = async (uids) => {
    try {
      await this.certificatesModel.deleteCertificate(uids);
      return true;
    } catch (error) {
      console.log(error);
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

  deleteCertificates = async (req, res) => {
    const { filesToDelete } = req.body;
    const { id, workerId, recordUid } = req.params;

    if (!filesToDelete || !filesToDelete.length) {
      throw new HttpError('No files provided in request body', 400);
    }

    let filesToDeleteFromS3 = [];
    let filesToDeleteFromDatabase = [];

    for (const file of filesToDelete) {
      let fileKey = makeFileKey(id, workerId, recordUid, file.uid);

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

      const deletionFromDatabase = await deleteRecordsFromDatabase(filesToDeleteFromDatabase);
      if (!deletionFromDatabase) {
        throw new HttpError(undefined, 500);
      }
    } catch (error) {
      console.log(error);
      throw new HttpError(undefined, 500);
    }

    await deleteCertificatesFromS3(filesToDeleteFromS3);
  };
}