const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models');

const { getLAReturnDates, setLAReturnDates } = require('../../../../../../routes/admin/local-authority-return/dates');

describe('server/routes/admin/local-authority-returns/dates', async () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('getLAReturnDates', async () => {
    beforeEach(() => {
      sinon.stub(models.AdminSettings, 'getValue').callsFake(async (Name) => {
        return {
          ID: 1,
          Name,
          Data: {
            type: 'date',
            value: Name === 'laReturnStartDate' ? '2021-06-18' : '2021-07-17',
          },
        };
      });
    });

    const request = {
      method: 'GET',
      url: '/api/admin/local-authority-returns/dates',
    };

    it('should reply with a 200', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLAReturnDates(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should reply with laReturnStartDate and laReturnEndDate', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLAReturnDates(req, res);

      expect(res._getData()).to.deep.equal({
        laReturnStartDate: new Date('2021-06-18'),
        laReturnEndDate: new Date('2021-07-17'),
      });
    });

    it('should reply with a 500 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.AdminSettings, 'getValue').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLAReturnDates(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('setLAReturnDates', async () => {
    const request = {
      method: 'POST',
      url: '/api/admin/local-authority-returns/dates',
      body: {
        laReturnStartDate: new Date('2021-06-19'),
        laReturnEndDate: new Date('2021-07-18'),
      },
    };

    beforeEach(() => {
      sinon.stub(models.AdminSettings, 'setValue').callsFake(async (Name, data) => {
        expect(data.type).to.deep.equal('date');
        expect(data.value).to.deep.equal(new Date(Name === 'laReturnStartDate' ? '2021-06-19' : '2021-07-18'));
        return [1];
      });
    });

    it('should reply with a 200', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await setLAReturnDates(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should reply with laReturnStartDate and laReturnEndDate', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await setLAReturnDates(req, res);

      expect(res._getData()).to.deep.equal({
        laReturnStartDate: new Date('2021-06-19'),
        laReturnEndDate: new Date('2021-07-18'),
      });
    });

    it('should reply with a 500 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.AdminSettings, 'setValue').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await setLAReturnDates(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should reply with a 404 when trying to update a field that does not exist', async () => {
      sinon.restore();

      sinon.stub(models.AdminSettings, 'setValue').returns([0]);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await setLAReturnDates(req, res);

      expect(res.statusCode).to.deep.equal(404);
    });
  });
});
