const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { updateEstablishment } = require('../../../../routes/establishments/updateSingleEstablishmentField');

describe('server/routes/establishments/updateSingleEstablishmentField', () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('updateEstablishment', () => {
    let req;
    let res;
    const establishmentId = 'a131313dasd123325453bac';

    const setup = async (body) => {
      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/updateSingleEstablishmentField`,
        params: { establishmentId },
        body,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    };

    it('should return 200 when the provided field has been updated', async () => {
      const body = {
        property: 'exampleFieldName',
        value: 'Yes',
      };

      await setup(body);

      sinon.stub(models.establishment, 'update').returns(null);

      await updateEstablishment(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 500 when the body is an empty object', async () => {
      const body = {};
      await setup(body);

      await updateEstablishment(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 500 when the update throws an error', async () => {
      const body = { staffRecruitmentData: { amountSpent: 100.4 } };
      await setup(body);

      sinon.stub(models.establishment, 'update').throws(() => new Error());

      await updateEstablishment(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
