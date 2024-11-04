const expect = require('chai').expect;
const sinon = require('sinon');
const { v4: uuidv4 } = require('uuid');

const models = require('../../../../../models');
const Qualification = require('../../../../../models/classes/qualification').Qualification;
const WorkerCertificateService = require('../../../../../routes/establishments/workerCertificate/workerCertificateService');
const BulkUploadQualificationHelper = require('../../../../../models/classes/helpers/bulkUploadQualificationHelper');

const buildMockQualificationEntity = async (override = {}) => {
  const propertiesToLoad = {
    qualification: {
      id: 152,
      title: 'Level 2 Adult Social Care Certificate',
      level: null,
      group: 'Certificate',
    },
    year: 2023,
    notes: 'test notes',
    ...override,
  };

  if (Qualification.prototype.validateQualificationRecord?.restore?.sinon) {
    Qualification.prototype.validateQualificationRecord.resolves(propertiesToLoad);
  } else {
    sinon.stub(Qualification.prototype, 'validateQualificationRecord').resolves(propertiesToLoad);
  }

  const mockQualificationEntity = new Qualification(null, null);
  await mockQualificationEntity.load();

  return mockQualificationEntity;
};

const buildMockWorkerQualification = (override = {}) => {
  return new models.workerQualifications({
    uid: uuidv4(),
    workerFk: '100',
    qualificationFk: 152,
    created: new Date(),
    updated: new Date(),
    source: 'Online',
    updatedBy: 'test',
    ...override,
  });
};

describe('/server/models/classes/helpers/bulkUploadQualificationHelper.js', () => {
  const mockWorkerId = '100';
  const mockWorkerUid = uuidv4();
  const mockEstablishmentId = '1234';
  const mockSavedBy = 'admin3';
  const mockBulkUploaded = true;
  const mockExternalTransaction = { sequelize: 'mockSequelizeTransactionObject' };

  const setupHelper = () => {
    return new BulkUploadQualificationHelper({
      workerId: mockWorkerId,
      workerUid: mockWorkerUid,
      establishmentId: mockEstablishmentId,
      savedBy: mockSavedBy,
      bulkUploaded: mockBulkUploaded,
      externalTransaction: mockExternalTransaction,
    });
  };

  it('should instantiates', () => {
    const helper = setupHelper();
    expect(helper instanceof BulkUploadQualificationHelper).to.be.true;
  });

  describe('processQualificationsEntities', () => {
    let mockExistingQualifications = [];
    let mockQualificationsEntities = [];
    const helper = setupHelper();

    beforeEach(async () => {
      mockExistingQualifications = [
        buildMockWorkerQualification({ qualificationFk: 31 }), // to modify
        buildMockWorkerQualification({ qualificationFk: 1 }), // to delete
        buildMockWorkerQualification({ qualificationFk: 2 }), // to delete
        buildMockWorkerQualification({ qualificationFk: 152 }), // to modify
      ];
      mockQualificationsEntities = await Promise.all(
        [
          { qualification: { id: 3 } }, // new
          { qualification: { id: 4 } }, // new
          { qualification: { id: 152 } }, // existing
          { qualification: { id: 31 } }, // existing
        ].map(buildMockQualificationEntity),
      );

      sinon.stub(helper, 'createNewQualification').callsFake(() => {
        return Promise.resolve();
      });
      sinon.stub(helper, 'updateQualification').callsFake(() => {
        return Promise.resolve();
      });
      sinon.stub(helper, 'deleteQualification').callsFake(() => {
        return Promise.resolve();
      });

      sinon.stub(models.workerQualifications, 'findAll').resolves(mockExistingQualifications);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call createNewQualification for each new qualification added', async () => {
      const returnedPromises = await helper.processQualificationsEntities(mockQualificationsEntities);

      expect(helper.createNewQualification).to.have.been.calledTwice;
      expect(helper.createNewQualification).to.have.been.calledWith(mockQualificationsEntities[0]);
      expect(helper.createNewQualification).to.have.been.calledWith(mockQualificationsEntities[1]);

      expect(returnedPromises)
        .to.be.an('array')
        .that.includes(helper.createNewQualification.returnValues[0], helper.createNewQualification.returnValues[1]);
    });

    it('should call updateQualification for each qualification that is modified', async () => {
      const returnedPromises = await helper.processQualificationsEntities(mockQualificationsEntities);

      expect(helper.updateQualification).to.have.been.calledTwice;
      expect(helper.updateQualification).to.have.been.calledWith(
        mockExistingQualifications[0],
        mockQualificationsEntities[3],
      );
      expect(helper.updateQualification).to.have.been.calledWith(
        mockExistingQualifications[3],
        mockQualificationsEntities[2],
      );

      expect(returnedPromises)
        .to.be.an('array')
        .that.includes(helper.updateQualification.returnValues[0], helper.updateQualification.returnValues[1]);
    });

    it('should call deleteQualification for each existing qualification that is not in the bulk upload entities', async () => {
      const returnedPromises = await helper.processQualificationsEntities(mockQualificationsEntities);

      expect(helper.deleteQualification).to.have.been.calledTwice;
      expect(helper.deleteQualification).to.have.been.calledWith(mockExistingQualifications[1]);
      expect(helper.deleteQualification).to.have.been.calledWith(mockExistingQualifications[2]);

      expect(returnedPromises)
        .to.be.an('array')
        .that.includes(helper.deleteQualification.returnValues[0], helper.deleteQualification.returnValues[1]);
    });
  });

  describe('createNewQualification', () => {
    beforeEach(() => {
      sinon.stub(Qualification.prototype, 'save').callsFake(() => {
        return Promise.resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    const helper = setupHelper();

    it('should return a promise that saves the new qualification to database', async () => {
      const entityFromBulkUpload = await buildMockQualificationEntity();
      const returnedPromise = helper.createNewQualification(entityFromBulkUpload);

      expect(entityFromBulkUpload.workerId).to.equal(mockWorkerId);
      expect(entityFromBulkUpload.workerUid).to.equal(mockWorkerUid);
      expect(entityFromBulkUpload.establishmentId).to.equal(mockEstablishmentId);

      expect(returnedPromise).to.be.a('promise');

      await returnedPromise;
      expect(entityFromBulkUpload.save).to.have.been.calledWith(
        mockSavedBy,
        mockBulkUploaded,
        0,
        mockExternalTransaction,
      );
    });
  });

  describe('updateQualification', () => {
    beforeEach(() => {
      sinon.stub(models.workerQualifications.prototype, 'save').callsFake(() => {
        return Promise.resolve();
      });
    });

    const helper = setupHelper();

    it('should return a promise that updates the existing record according to incoming bulk upload entity', async () => {
      const mockExistingRecord = buildMockWorkerQualification();
      const mockEntityFromBulkUpload = await buildMockQualificationEntity();

      const returnedPromise = helper.updateQualification(mockExistingRecord, mockEntityFromBulkUpload);

      expect(mockExistingRecord.updatedBy).to.equal(mockSavedBy.toLowerCase());
      expect(mockExistingRecord.source).to.equal('Bulk');
      expect(mockExistingRecord.notes).to.equal(mockEntityFromBulkUpload.notes);
      expect(mockExistingRecord.year).to.equal(mockEntityFromBulkUpload.year);

      expect(returnedPromise).to.be.a('promise');

      await returnedPromise;
      expect(mockExistingRecord.save).to.have.been.calledWith({ transaction: mockExternalTransaction });
    });
  });

  describe('deleteQualification', () => {
    let qualificationCertificateServiceSpy;
    const helper = setupHelper();

    beforeEach(() => {
      sinon.stub(models.workerQualifications.prototype, 'destroy').callsFake(() => {
        return Promise.resolve();
      });
      qualificationCertificateServiceSpy = sinon.stub(
        helper.qualificationCertificateService,
        'deleteCertificatesWithTransaction',
      );
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a promise that deletes the qualification record from database', async () => {
      const mockExistingRecord = buildMockWorkerQualification();
      sinon.stub(mockExistingRecord, 'getQualificationCertificates').returns([]);

      const returnedPromise = helper.deleteQualification(mockExistingRecord);
      expect(returnedPromise).to.be.a('promise');

      await returnedPromise;
      expect(mockExistingRecord.destroy).to.have.been.calledWith({ transaction: mockExternalTransaction });
      expect(qualificationCertificateServiceSpy).not.to.have.been.called;
    });

    it('should call deleteCertificatesWithTransaction if there are any certificates attached to this qualification', async () => {
      const mockExistingRecord = buildMockWorkerQualification();
      const mockCertificateRecords = [
        { uid: '123', key: 'abc' },
        { uid: '456', key: 'def' },
      ];
      sinon.stub(mockExistingRecord, 'getQualificationCertificates').returns(mockCertificateRecords);

      const returnedPromise = helper.deleteQualification(mockExistingRecord);
      expect(returnedPromise).to.be.a('promise');

      await returnedPromise;
      expect(qualificationCertificateServiceSpy).to.have.been.calledWith(
        mockCertificateRecords,
        mockExternalTransaction,
      );
      expect(mockExistingRecord.destroy).to.have.been.calledWith({ transaction: mockExternalTransaction });
    });
  });
});
