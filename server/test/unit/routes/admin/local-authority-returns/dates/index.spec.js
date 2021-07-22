const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const { getLAReturnDates } = require('../../../../../../routes/admin/local-authority-return/dates');

describe('server/routes/admin/local-authority-returns/dates', async () => {
  describe('getLAReturnDates', async () => {
    beforeEach(() => {});

    afterEach(async () => {
      sinon.restore();
    });

    it('should reply with a 200', async () => {
      const request = {
        method: 'GET',
        url: '/api/admin/local-authority-returns/dates',
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      getLAReturnDates(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should reply with laStartDate and laEndDate', async () => {
      const request = {
        method: 'GET',
        url: '/api/admin/local-authority-returns/dates',
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      getLAReturnDates(req, res);

      expect(res._getData()).to.deep.equal({
        laStartDate: new Date('2021-06-18'),
        laEndDate: new Date('2021-07-17'),
      });
    });
  });
});
