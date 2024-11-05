const { compact } = require('lodash');

const models = require('../../index');
const WorkerCertificateService = require('../../../routes/establishments/workerCertificate/workerCertificateService');

class BulkUploadQualificationHelper {
  constructor({ workerId, workerUid, establishmentId, savedBy, externalTransaction }) {
    this.workerId = workerId;
    this.workerUid = workerUid;
    this.establishmentId = establishmentId;
    this.savedBy = savedBy;
    this.bulkUploaded = true;
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

    for (const bulkUploadEntity of qualificationsEntities) {
      const currentQualificationId = bulkUploadEntity?._qualification?.id;
      const existingQualification = allQualificationRecords.find(
        (record) => record.qualificationFk === currentQualificationId,
      );

      if (existingQualification) {
        promisesToReturn.push(this.updateQualification(existingQualification, bulkUploadEntity));
      } else {
        promisesToReturn.push(this.createNewQualification(bulkUploadEntity));
      }
    }

    const bulkUploadQualificationFks = compact(qualificationsEntities.map((entity) => entity?._qualification?.id));
    const qualificationsToDelete = allQualificationRecords.filter(
      (qualification) => !bulkUploadQualificationFks.includes(qualification.qualificationFk),
    );
    for (const qualification of qualificationsToDelete) {
      promisesToReturn.push(this.deleteQualification(qualification));
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
      source: 'Bulk',
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
      await this.qualificationCertificateService.deleteCertificatesWithTransaction(
        certificatesFound,
        this.externalTransaction,
      );
    }

    return existingRecord.destroy({ transaction: this.externalTransaction });
  }
}

module.exports = BulkUploadQualificationHelper;
