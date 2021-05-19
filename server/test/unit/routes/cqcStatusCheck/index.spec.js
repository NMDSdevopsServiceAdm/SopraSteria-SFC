const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const CQCDataAPI = require('../../../../utils/CQCDataAPI');

const { cqcStatusCheck } = require('../../../../routes/cqcStatusCheck');

describe('server/routes/establishments/cqcStatus', async () => {
  beforeEach(() => {
    sinon.stub(CQCDataAPI, 'getWorkplaceCQCData').callsFake(async (locationID) => {
      if (locationID === registeredLocationId) {
        return registeredURLResponse;
      } else if (locationID === deregisteredLocationId) {
        return deregisteredURLResponse;
      } else {
        return null;
      }
    });
  });

  afterEach(async () => {
    sinon.restore();
  });

  const registeredLocationId = '1-109009203';
  const deregisteredLocationId = '1-799116841';

  const registeredURLResponse = {
    registrationStatus: 'Registered',
    postalCode: 'SK10 7ED',
  };

  const deregisteredURLResponse = {
    registrationStatus: 'Deregistered',
    postalCode: 'SK10 7EB',
  };

  it('should accept a locationID in the request body', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
      query: {
        postcode: 'SK10 7ED',
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
      query: {
        postcode: 'SK10 7ED',
      },
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await cqcStatusCheck(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return a true flag is the service is registered with CQC and postcode matches', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
      query: {
        postcode: 'SK10 7ED',
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

  it('should return a true flag is the service is registered with CQC and ASC-WDS postcode is lower case', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
      query: {
        postcode: 'sk10 7ed',
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

  it('should return a true flag is the service is registered with CQC and CQC postcode is lower case', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
      query: {
        postcode: 'SK10 7ED',
      },
    };

    const expectedResult = {
      cqcStatusMatch: true,
    };

    registeredURLResponse.postalCode = 'sk10 7ed';

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
      query: {
        postcode: 'SK10 7ED',
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

  it('should return a false flag is the service postcode does not match with CQC', async () => {
    const request = {
      method: 'GET',
      url: `/api/cqcStatusCheck/${registeredLocationId}`,
      params: {
        locationID: registeredLocationId,
      },
      query: {
        postcode: 'WA5 6BL',
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
