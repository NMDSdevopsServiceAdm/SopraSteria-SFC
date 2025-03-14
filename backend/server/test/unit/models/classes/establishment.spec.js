const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../models');
const Establishment = require('../../../../models/classes/establishment').Establishment;
const WdfCalculator = require('../../../../models/classes/wdfCalculator').WdfCalculator;

describe('Establishment Class', () => {
  let establishment;

  afterEach(() => {
    sinon.restore();
  });

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
  });

  describe('save', () => {
    let transaction = {};
    const timestamp = new Date();
    const theLoggedInUser = '';

    function updateEstablishmentProperties() {
      sinon
        .stub(establishment._properties, 'get')
        .withArgs('Name')
        .returns({ property: 'Sub Workplace' })
        .withArgs('MainServiceFK')
        .returns({ property: { id: 16, name: 'Head office services' } });

      establishment._address1 = 'address 1';
      establishment._postcode = 'LS1 5AA';
      establishment._isRegulated = false;
      establishment._workerEntities = null;
    }

    beforeEach(() => {
      const la = {
        cssrRecord: {
          id: 123,
          name: 'Kirklees',
          nmdsIdLetter: 'J',
        },
      };

      sinon.stub(models.pcodedata, 'getLinkedCssrRecordsFromPostcode').resolves([{ postcode: 'HD1 1DA', ...la }]);

      const createdEstablishment = {
        get() {
          return { EstablishmentID: 12, created: timestamp, updated: timestamp };
        },
      };

      sinon.stub(models.establishment, 'create').returns(createdEstablishment);
      sinon.stub(models.establishmentAudit, 'bulkCreate').returns([]);
    });

    describe('new establishment', () => {
      it('should call the database to update currentEligibility if created via bulk upload and eligible', async () => {
        establishment = new Establishment('admin', 'NEW');
        updateEstablishmentProperties();
        sinon.stub(establishment, 'isWdfEligible').returns({
          currentEligibility: true,
        });
        const updateFundingEligibilitySpy = sinon.stub(models.establishment, 'update');
        const establishmentAuditSpy = sinon.stub(models.establishmentAudit, 'create').resolves(true);

        await establishment.save(theLoggedInUser, true, transaction, true);

        expect(updateFundingEligibilitySpy).to.have.been.called;
        expect(establishmentAuditSpy).to.have.been.called;
      });

      it('should not call the database to update currentEligibility if created via bulk upload and not eligible', async () => {
        establishment = new Establishment('admin', 'NEW');
        updateEstablishmentProperties();
        sinon.stub(establishment, 'isWdfEligible').returns({
          currentEligibility: false,
        });
        const updateFundingEligibilitySpy = sinon.stub(models.establishment, 'update');
        const establishmentAuditSpy = sinon.stub(models.establishmentAudit, 'create').resolves(true);

        await establishment.save(theLoggedInUser, true, transaction, true);

        expect(updateFundingEligibilitySpy).not.to.have.been.called;
        expect(establishmentAuditSpy).not.to.have.been.called;
      });

      it('should not call the database to update currentEligibility if not created via bulk upload', async () => {
        establishment = new Establishment('admin', null);
        updateEstablishmentProperties();

        sinon.stub(WdfCalculator, 'calculate');

        const isWdfEligibleSpy = sinon.stub(establishment, 'isWdfEligible');
        const updateFundingEligibilitySpy = sinon.stub(models.establishment, 'update');
        const establishmentAuditSpy = sinon.stub(models.establishmentAudit, 'create');

        await establishment.save(theLoggedInUser, false, transaction, true);

        expect(isWdfEligibleSpy).not.to.have.been.called;
        expect(updateFundingEligibilitySpy).not.to.have.been.called;
        expect(establishmentAuditSpy).not.to.have.been.called;
      });
    });
  });
});
