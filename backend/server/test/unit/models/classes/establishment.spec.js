const models = require('../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const Establishment = require('../../../../models/classes/establishment').Establishment;
const WdfCalculator = require('../../../../models/classes/wdfCalculator').WdfCalculator;
const ServiceCache = require('../../../../models/cache/singletons/services').ServiceCache;

let establishment;

describe('Establishment Class', () => {
  afterEach(() => {
    sinon.restore();
  });

  const booleanValues = [true, false, null];

  describe('load()', () => {
    beforeEach(() => {
      establishment = new Establishment();
    });

    it('should set CQC to null in shareWith if an establishment is not CQC regulated', async () => {
      const nonCqc = {
        isRegulated: false,
        shareWith: { cqc: true, localAuthorities: false },
        locationId: '1-12234556',
      };
      const nonCQCEst = await establishment.load(nonCqc);

      expect(nonCqc.shareWith.cqc).to.equal(null);
      expect(nonCQCEst).to.deep.equal(true);
    });

    it('should not set CQC to null in shareWith if an establishment is CQC regulated', async () => {
      const cqc = { isRegulated: true, shareWith: { cqc: true, localAuthorities: false }, locationId: '1-12234556' };
      const CQCEst = await establishment.load(cqc);

      expect(cqc.shareWith.cqc).to.equal(true);
      expect(CQCEst).to.deep.equal(true);
    });

    it('should return parent name and postcode', async () => {
      const parent = { parentName: 'Parent Est', parentPostcode: 'LE5 1AA' };
      const parentEst = await establishment.load(parent);

      expect(parent.parentName).to.equal('Parent Est');
      expect(parent.parentPostcode).to.equal('LE5 1AA');
      expect(parentEst).to.deep.equal(true);
    });

    booleanValues.forEach((value) => {
      it(`should return payAndPensionsMiniFlowViewed when in the document and the value is ${value} `, async () => {
        const document = { payAndPensionsMiniFlowViewed: value };
        const establishmentLoaded = await establishment.load(document);

        expect(establishmentLoaded).to.deep.equal(true);
        expect(establishment._payAndPensionsMiniFlowViewed).to.deep.equal(value);
      });
    });
  });

  describe('save()', () => {
    const postCode = 'CA1 1AA';

    const updateEstablishmentProperties = (overrides) => {
      sinon
        .stub(establishment._properties, 'get')
        .withArgs('Name')
        .returns({ property: 'Sub Workplace' })
        .withArgs('MainServiceFK')
        .returns({ property: { id: 16, name: 'Head office services' } });

      establishment._address1 = 'address 1';
      establishment._postcode = postCode;
      establishment._isRegulated = false;
      establishment._workerEntities = null;

      if (overrides?.propertiesToUpdate) {
        overrides?.propertiesToUpdate.forEach((property) => {
          establishment[property.name] = property.value;
        });
      }
    };

    const theLoggedInUser = 'admin';

    const createNewEstablishment = (overrides) => {
      let bulkUploadStatus = overrides.bulkUploadStatus ? overrides.bulkUploadStatus : null;
      establishment = new Establishment(theLoggedInUser, bulkUploadStatus);
    };

    let isWdfEligibleSpy;

    const setupTests = async (overrides = {}) => {
      createNewEstablishment(overrides);
      updateEstablishmentProperties(overrides);
      isWdfEligibleSpy = sinon.stub(establishment, 'isWdfEligible').returns({
        currentEligibility: overrides.currentEligibility,
      });

      await establishment.save(
        theLoggedInUser,
        (bulkUploaded = overrides.bulkUploaded),
        (transaction = {}),
        (associatedEntities = true),
      );
    };

    let updateFundingEligibilitySpy;
    let establishmentAuditSpy;

    beforeEach(() => {
      const la = {
        cssrRecord: {
          id: 102,
          name: 'Cumbria',
          nmdsIdLetter: 'F',
        },
      };

      sinon.stub(models.sequelize, 'query').resolves([{ nextval: 1005126 }]);
      sinon.stub(models.sequelize, 'transaction').callsFake((dbOperations) => dbOperations());

      let postCodeResponse = { postcode: postCode, ...la };

      sinon.stub(models.pcodedata, 'getLinkedCssrRecordsCompleteMatch').callsFake(async () => {
        return postCodeResponse;
      });

      const timestamp = new Date();

      const createdEstablishment = {
        get() {
          return { EstablishmentID: 12, created: timestamp, updated: timestamp };
        },
      };

      sinon.stub(models.establishment, 'create').returns(createdEstablishment);

      updateFundingEligibilitySpy = sinon.stub(models.establishment, 'update');
      establishmentAuditSpy = sinon.stub(models.establishmentAudit, 'create');
    });

    describe('new establishment', () => {
      it('should call the database to update currentEligibility if created via bulk upload and eligible', async () => {
        await setupTests({ bulkUploadStatus: 'NEW', currentEligibility: true, bulkUploaded: true });

        establishmentAuditSpy.resolves(true);

        expect(updateFundingEligibilitySpy).to.have.been.called;
        expect(establishmentAuditSpy).to.have.been.called;
      });

      it('should not call the database to update currentEligibility if created via bulk upload and not eligible', async () => {
        setupTests({ bulkUploadStatus: 'NEW', currentEligibility: false, bulkUploaded: true });

        establishmentAuditSpy.resolves(true);

        expect(updateFundingEligibilitySpy).not.to.have.been.called;
        expect(establishmentAuditSpy).not.to.have.been.called;
      });

      it('should not call the database to update currentEligibility if not created via bulk upload', async () => {
        setupTests({ bulkUploadStatus: null, bulkUploaded: false });

        sinon.stub(WdfCalculator, 'calculate').resolves();

        expect(isWdfEligibleSpy).not.to.have.been.called;
        expect(updateFundingEligibilitySpy).not.to.have.been.called;
        expect(establishmentAuditSpy).not.to.have.been.called;
      });

      booleanValues.forEach((value) => {
        it(`should call the database to update payAndPensionsMiniFlowViewed when the value is ${value}`, async () => {
          await setupTests({
            bulkUploadStatus: 'NEW',
            currentEligibility: true,
            bulkUploaded: true,
            propertiesToUpdate: [{ name: '_payAndPensionsMiniFlowViewed', value: value }],
          });

          establishmentAuditSpy.resolves(true);

          expect(establishmentAuditSpy).to.have.been.called;
          expect(establishment._payAndPensionsMiniFlowViewed).to.deep.equal(value);
        });
      });
    });
  });

  describe('restore', () => {
    const services = [
      {
        id: 1,
        name: 'foo',
        category: 'foo',
      },
      {
        id: 2,
        name: 'foo',
        category: 'foo',
      },
      {
        id: 3,
        name: 'foo',
        category: 'foo',
      },
      {
        id: 4,
        name: 'foo',
        category: 'foo',
      },
    ];

    const testWorkplace = {
      id: 4321,
      isRegulated: false,
      MainServiceFKValue: 1,
      nmdsId: 'I1234567',
      NameValue: 'Test Workplace',
      address1: 'address 1',
      postcode: 'CA1 1AA',
      getCareWorkforcePathwayReasons() {},
      getDelegatedHealthcareActivities() {},
      mainService: services[0],
    };

    beforeEach(() => {
      establishment = new Establishment();

      establishment._mainService = testWorkplace.MainServiceFKValue;

      sinon.stub(models.establishmentServiceUsers, 'findAll').returns([
        {
          serviceUserId: 2,
        },
      ]);
      sinon.stub(models.establishmentServices, 'findAll').returns([
        { serviceId: 1, other: null },
        { serviceId: 11, other: null },
      ]);

      sinon.stub(ServiceCache, 'allMyServices').returns(services);
      sinon.stub(models.services, 'findOne').returns([services[0]]);
      sinon.stub(models.serviceUsers, 'findAll').returns([
        {
          id: 2,
        },
      ]);
      sinon.stub(models.establishmentCapacity, 'findAll').returns([]);
      sinon.stub(models.establishmentJobs, 'findAll').returns([]);
      sinon.stub(models.pcodedata, 'getLinkedCssrRecordsFromPostcode').returns([]);
    });

    booleanValues.forEach((value) => {
      it(`should restore payAndPensionsMiniFlowViewed when the value is ${value}`, async () => {
        const establishmentStub = sinon.stub(models.establishment, 'findOne');
        establishmentStub.onCall(0).returns({ ...testWorkplace, payAndPensionsMiniFlowViewed: value });
        establishmentStub.onCall(1).returns(testWorkplace.id);

        const restoredEstablishment = await establishment.restore(testWorkplace.id);

        expect(restoredEstablishment).to.equal(true);
        expect(establishment._payAndPensionsMiniFlowViewed).to.equal(value);
      });
    });
  });

  describe('toJSON', () => {
    beforeEach(() => {
      establishment = new Establishment();
    });

    booleanValues.forEach((value) => {
      it(`should return payAndPensionsMiniFlowViewed when the value is ${value}`, async () => {
        establishment.id = 1234;
        establishment.postcode = 'CA1 1AA';
        establishment._payAndPensionsMiniFlowViewed = value;

        const establishmentToJson = await establishment.toJSON();

        expect(establishmentToJson.payAndPensionsMiniFlowViewed).to.deep.equal(value);
      });
    });
  });
});
