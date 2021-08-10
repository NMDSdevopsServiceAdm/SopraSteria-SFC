const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models');

const { getLocalAuthorities } = require('../../../../../../routes/admin/local-authority-return/monitor');

describe('server/routes/admin/local-authority-returns/local-authorities', async () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('getLocalAuthorities', async () => {
    beforeEach(() => {
      sinon.stub(models.LocalAuthorities, 'getAll').callsFake(async () => {
        return [
          {
            LocalAuthorityName: 'Example B Authority 1',
            ThisYear: 10,
            Status: 'Not Updated',
            Notes: null,
            establishment: {
              nmdsId: 'B123456',
            },
          },
          {
            LocalAuthorityName: 'Example B Authority 2',
            ThisYear: 50,
            Status: 'Update, Not Complete',
            Notes: 'This is a comment',
            establishment: {
              nmdsId: 'B112583',
            },
          },
          {
            LocalAuthorityName: 'Example C Authority 1',
            ThisYear: 54,
            Status: 'Update, Complete',
            Notes: 'Hello',
            establishment: {
              nmdsId: 'C223485',
            },
          },
          {
            LocalAuthorityName: 'Example C Authority 2',
            ThisYear: 155,
            Status: 'Update, Confirmed',
            Notes: null,
            establishment: {
              nmdsId: 'C223485',
            },
          },
        ];
      });
    });

    const request = {
      method: 'GET',
      url: '/api/admin/local-authority-returns/local-authorities',
    };

    it('should reply with a 200', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthorities(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return a list of all the local authorities', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthorities(req, res);

      const expectedResponse = {
        B: [
          { name: 'Example B Authority 1', status: 'Not Updated', workers: 10, notes: false },
          { name: 'Example B Authority 2', status: 'Update, Not Complete', workers: 50, notes: true },
        ],
        C: [
          { name: 'Example C Authority 1', status: 'Update, Complete', workers: 54, notes: true },
          { name: 'Example C Authority 2', status: 'Update, Confirmed', workers: 155, notes: false },
        ],
      };

      expect(res._getData()).to.deep.equal(expectedResponse);
    });

    it('should reply with a 503 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.LocalAuthorities, 'getAll').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthorities(req, res);

      expect(res.statusCode).to.deep.equal(503);
    });
  });
});
