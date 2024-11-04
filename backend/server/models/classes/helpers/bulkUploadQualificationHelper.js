const { compact } = require('lodash');

const models = require('../../index');
const WorkerCertificateService = require('../../../routes/establishments/workerCertificate/workerCertificateService');

class BulkUploadQualificationHelper {
  constructor({ workerId, workerUid, establishmentId, savedBy, bulkUploaded = true, externalTransaction }) {
    this.workerId = workerId;
    this.workerUid = workerUid;
    this.establishmentId = establishmentId;
    this.savedBy = savedBy;
    this.bulkUploaded = bulkUploaded;
    this.externalTransaction = externalTransaction;
    this.qualificationCertificateService = WorkerCertificateService.initialiseQualifications();
  }

  async processQualificationsEntities(qualificationsEntities) {
    const promisesToReturn = [];

    const allQualificationRecords = await models.workerQualifications.findAll({
      where: {
        workerFk: this.workerId,
      },
    });

    const existingQualificationFks = allQualificationRecords.map((record) => record.qualificationFk);
    const bulkUploadQualificationFks = compact(qualificationsEntities.map((entity) => entity?._qualification?.id));

    for (const bulkUploadEntity of qualificationsEntities) {
      const currentQualificationId = bulkUploadEntity?._qualification?.id;
      const qualificationExists = existingQualificationFks.includes(currentQualificationId);

      if (qualificationExists) {
        const recordToUpdate = allQualificationRecords.find(
          (record) => record.qualificationFk === currentQualificationId,
        );
        promisesToReturn.push(this.updateQualification(recordToUpdate, bulkUploadEntity));
      } else {
        promisesToReturn.push(this.createNewQualification(bulkUploadEntity));
      }
    }

    for (const qualification of allQualificationRecords) {
      if (!bulkUploadQualificationFks.includes(qualification.qualificationFk)) {
        promisesToReturn.push(this.deleteQualification(qualification));
      }
    }

    return promisesToReturn;
  }

  createNewQualification(entityFromBulkUpload) {
    entityFromBulkUpload.workerId = this.workerId;
    entityFromBulkUpload.workerUid = this.workerUid;
    entityFromBulkUpload.establishmentId = this.establishmentId;

    return entityFromBulkUpload.save(this.savedBy, this.bulkUploaded, 0, this.externalTransaction);
  }

  updateQualification(existingRecord, entityFromBulkUpload) {
    const fieldsToUpdate = {
      source: this.bulkUploaded ? 'Bulk' : 'Online',
      updatedBy: this.savedBy.toLowerCase(),
      notes: entityFromBulkUpload.notes ?? existingRecord.notes,
      year: entityFromBulkUpload.year ?? existingRecord.year,
    };

    existingRecord.set(fieldsToUpdate);

    return existingRecord.save({ transaction: this.externalTransaction });
  }

  async deleteQualification(existingRecord) {
    const certificatesFound = await existingRecord.getQualificationCertificates();
    if (certificatesFound?.length) {
      this.qualificationCertificateService.deleteCertificatesWithTransaction(
        certificatesFound,
        this.externalTransaction,
      );
    }

    return existingRecord.destroy({ transaction: this.externalTransaction });
  }
}

module.exports = BulkUploadQualificationHelper;
