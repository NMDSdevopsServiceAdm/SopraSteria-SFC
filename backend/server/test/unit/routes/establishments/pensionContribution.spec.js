const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { updatePensionContribution } = require('../../../../routes/establishments/pensionContribution');

describe('server/routes/establishments/pensionContribution', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('updatePensionContribution', () => {
    let req;
    let res;
    const establishmentId = '999999999';

    const setup = async (body) => {
      req = httpMocks.createRequest({
        method: 'POST',
        body,
      });

      req.establishmentId = establishmentId;

      res = httpMocks.createResponse();
    };

    it('should update pensionContribution and clear percentage when value is No', async () => {
      const body = {
        pensionContribution: 'No',
      };

      await setup(body);

      const updateStub = sinon.stub(models.establishment, 'updateEstablishment').resolves();
      sinon.stub(models.establishment, 'findOne').resolves({
        pensionContribution: 'No',
        pensionContributionPercentage: null,
      });

      await updatePensionContribution(req, res);

      expect(
        updateStub.calledOnceWith(establishmentId, {
          pensionContribution: 'No',
          pensionContributionPercentage: null,
        }),
      ).to.be.true;

      expect(res.statusCode).to.equal(200);
    });

    it('should update both pensionContribution and percentage when Yes', async () => {
      const body = {
        pensionContribution: 'Yes',
        pensionContributionPercentage: 5,
      };

      await setup(body);

      const updateStub = sinon.stub(models.establishment, 'updateEstablishment').resolves();
      sinon.stub(models.establishment, 'findOne').resolves(body);

      await updatePensionContribution(req, res);

      expect(updateStub.calledOnceWith(establishmentId, body)).to.be.true;
      expect(res.statusCode).to.equal(200);
    });

    it('should set percentage to null if empty string is sent', async () => {
      const body = {
        pensionContributionPercentage: '',
      };

      await setup(body);

      const updateStub = sinon.stub(models.establishment, 'updateEstablishment').resolves();
      sinon.stub(models.establishment, 'findOne').resolves({
        pensionContributionPercentage: null,
      });

      await updatePensionContribution(req, res);

      expect(
        updateStub.calledOnceWith(establishmentId, {
          pensionContributionPercentage: null,
        }),
      ).to.be.true;

      expect(res.statusCode).to.equal(200);
    });

    it('should return 400 when no valid fields provided', async () => {
      await setup({});

      await updatePensionContribution(req, res);

      expect(res.statusCode).to.equal(400);
    });

    it('should return 500 when database throws error', async () => {
      const body = { pensionContribution: 'Yes' };

      await setup(body);

      sinon.stub(models.establishment, 'updateEstablishment').rejects(new Error('DB error'));

      await updatePensionContribution(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
