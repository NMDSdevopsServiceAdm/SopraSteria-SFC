const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const sinon_sandbox = sinon.createSandbox();
const axios = require('axios');

const { cqcStatusCheck } = require('../../../../routes/cqcStatusCheck');

describe('server/routes/establishments/cqcStatus', () => {
  afterEach(() => {
    sinon_sandbox.restore();
  });

  const url = 'https://api.cqc.org.uk/public/v1/locations/';

  const registeredLocationId = '1-109009203';
  const deregisteredLocationId = '1-799116841';

  const registeredLocationURL = url + registeredLocationId;
  const deregisteredLocationURL = url + deregisteredLocationId;

  const registeredURLResponse = {
    data: {
      registrationStatus: 'Registered',
    },
  };

  const deregisteredURLResponse = {
    data: {
      registrationStatus: 'Deregistered',
    },
  };

  sinon.stub(axios, 'get').callsFake(async (url) => {
    if (url === registeredLocationURL) {
      return registeredURLResponse;
    } else if (url === deregisteredLocationURL) {
      return deregisteredURLResponse;
    } else {
      return null;
    }
  });

  it('should accept a locationID in the request body', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await cqcStatusCheck(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return a 500 status if no locationID is passed', async () => {
    const request = {
      method: 'GET',
      url: '/api/cqcStatusCheck/',
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await cqcStatusCheck(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });

  it('should return a 200 status when call is successful', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await cqcStatusCheck(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return a true flag is the service is registered with CQC', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
    };

    const expectedResult = {
      cqcStatusMatch: true,
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await cqcStatusCheck(req, res);

    expect(res._getData()).to.deep.equal(expectedResult);
  });

  it('should return a false flag is the service is deregistered with CQC', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${deregisteredLocationId}`,
      params: {
        locationID: deregisteredLocationId,
      },
    };

    const expectedResult = {
      cqcStatusMatch: false,
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await cqcStatusCheck(req, res);

    expect(res._getData()).to.deep.equal(expectedResult);
  });
});
