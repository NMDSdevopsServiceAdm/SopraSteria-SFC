const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models');

const {
  getLocalAuthorities,
  getLocalAuthority,
  updateLocalAuthority,
  resetLocalAuthorities,
} = require('../../../../../../routes/admin/local-authority-return/monitor');

describe('server/routes/admin/local-authority-returns/monitor', async () => {
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
            Status: 'Not updated',
            Notes: null,
            LocalAuthorityUID: 'SomeUID1',
            establishment: {
              nmdsId: 'B123456',
            },
          },
          {
            LocalAuthorityName: 'Example B Authority 2',
            ThisYear: 50,
            Status: 'Update, not complete',
            Notes: 'This is a comment',
            LocalAuthorityUID: 'SomeUID2',
            establishment: {
              nmdsId: 'B112583',
            },
          },
          {
            LocalAuthorityName: 'Example C Authority 1',
            ThisYear: 54,
            Status: 'Update, complete',
            Notes: 'Hello',
            LocalAuthorityUID: 'SomeUID3',
            establishment: {
              nmdsId: 'C223485',
            },
          },
          {
            LocalAuthorityName: 'Example C Authority 2',
            ThisYear: 155,
            Status: 'Confirmed, complete',
            Notes: null,
            LocalAuthorityUID: 'SomeUID4',
            establishment: {
              nmdsId: 'C223485',
            },
          },
        ];
      });
    });

    const request = {
      method: 'GET',
      url: '/api/admin/local-authority-returns/monitor',
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
          {
            name: 'Example B Authority 1',
            status: 'Not updated',
            workers: 10,
            notes: false,
            localAuthorityUID: 'SomeUID1',
          },
          {
            name: 'Example B Authority 2',
            status: 'Update, not complete',
            workers: 50,
            notes: true,
            localAuthorityUID: 'SomeUID2',
          },
        ],
        C: [
          {
            name: 'Example C Authority 1',
            status: 'Update, complete',
            workers: 54,
            notes: true,
            localAuthorityUID: 'SomeUID3',
          },
          {
            name: 'Example C Authority 2',
            status: 'Confirmed, complete',
            workers: 155,
            notes: false,
            localAuthorityUID: 'SomeUID4',
          },
        ],
      };

      expect(res._getData()).to.deep.equal(expectedResponse);
    });

    it('should reply with a 500 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.LocalAuthorities, 'getAll').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthorities(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('getLocalAuthority', () => {
    beforeEach(() => {
      sinon.stub(models.LocalAuthorities, 'findById').callsFake(async () => {
        return {
          LocalAuthorityName: 'Example Authority 1',
          ThisYear: 10,
          Status: 'Not updated',
          Notes: 'There are some notes',
          LocalAuthorityUID: 'someuid',
        };
      });
    });

    const request = {
      method: 'GET',
      url: 'api/admin/local-authority-return/monitor',
      params: {
        uid: 'someuid',
      },
    };

    it('should reply with a 200', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthority(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return a local authority for a given id', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthority(req, res);

      const expectedResponse = {
        name: 'Example Authority 1',
        workers: 10,
        notes: 'There are some notes',
        status: 'Not updated',
      };

      expect(res._getData()).to.deep.equal(expectedResponse);
    });

    it('should reply with a 500 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.LocalAuthorities, 'findById').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await getLocalAuthority(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('updateLocalAuthority', () => {
    beforeEach(() => {
      sinon.stub(models.LocalAuthorities, 'updateLA');
    });

    const request = {
      method: 'POST',
      url: 'api/admin/local-authority-return/monitor',
      params: {
        uid: 'someuid',
      },
      body: {
        workers: 123,
        status: 'Not Updated',
        notes: 'These are some notes!',
      },
    };

    it('should reply with a 200', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateLocalAuthority(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should reply with a 500 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.LocalAuthorities, 'updateLA').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateLocalAuthority(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('resetLocalAuthorities', () => {
    beforeEach(() => {
      sinon.stub(models.LocalAuthorities, 'resetLocalAuthorities');
      sinon.stub(models.LocalAuthorities, 'getAll').callsFake(async () => {
        return [
          {
            LocalAuthorityName: 'Example B Authority 1',
            ThisYear: 10,
            Status: 'Not updated',
            Notes: null,
            LocalAuthorityUID: 'SomeUID1',
            establishment: {
              nmdsId: 'B123456',
            },
          },
          {
            LocalAuthorityName: 'Example B Authority 2',
            ThisYear: 50,
            Status: 'Not updated',
            Notes: null,
            LocalAuthorityUID: 'SomeUID2',
            establishment: {
              nmdsId: 'B112583',
            },
          },
          {
            LocalAuthorityName: 'Example C Authority 1',
            ThisYear: 54,
            Status: 'Not updated',
            Notes: null,
            LocalAuthorityUID: 'SomeUID3',
            establishment: {
              nmdsId: 'C223485',
            },
          },
          {
            LocalAuthorityName: 'Example C Authority 2',
            ThisYear: 155,
            Status: 'Not updated',
            Notes: null,
            LocalAuthorityUID: 'SomeUID4',
            establishment: {
              nmdsId: 'C223485',
            },
          },
        ];
      });
    });

    const request = {
      method: 'PUT',
      url: 'api/admin/local-authority-return/monitor/reset',
    };

    it('should reply with a 200', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await resetLocalAuthorities(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return a list of all the local authorities', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await resetLocalAuthorities(req, res);

      const expectedResponse = {
        B: [
          {
            name: 'Example B Authority 1',
            status: 'Not updated',
            workers: 10,
            notes: false,
            localAuthorityUID: 'SomeUID1',
          },
          {
            name: 'Example B Authority 2',
            status: 'Not updated',
            workers: 50,
            notes: false,
            localAuthorityUID: 'SomeUID2',
          },
        ],
        C: [
          {
            name: 'Example C Authority 1',
            status: 'Not updated',
            workers: 54,
            notes: false,
            localAuthorityUID: 'SomeUID3',
          },
          {
            name: 'Example C Authority 2',
            status: 'Not updated',
            workers: 155,
            notes: false,
            localAuthorityUID: 'SomeUID4',
          },
        ],
      };

      expect(res._getData()).to.deep.equal(expectedResponse);
    });

    it('should reply with a 500 when there is an error', async () => {
      sinon.restore();

      sinon.stub(models.LocalAuthorities, 'resetLocalAuthorities').throws();
      sinon.stub(models.LocalAuthorities, 'getAll').throws();

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await resetLocalAuthorities(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
