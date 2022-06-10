const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const CQCDataAPI = require('../../../../utils/CQCDataAPI');

const { cqcStatusCheck, checkMainServiceMatch } = require('../../../../routes/cqcStatusCheck');

const locationIDs = [
  { locationID: '1-2322162968', mainService: 'Care home services with nursing' },
  { locationID: '1-118415299', mainService: 'Care home services without nursing' },
  { locationID: '1-114954321', mainService: 'Care home services without nursing' },
  { locationID: '1-159609284', mainService: 'Community based services for people who misuse substances' },
  { locationID: '1-110984029', mainService: 'Community based services for people with a learning disability' },
  { locationID: '1-2148527928', mainService: 'Community based services for people with mental health needs' },
  { locationID: '1-2860511845', mainService: 'Community healthcare services' },
  { locationID: '1-5241354916', mainService: 'Domiciliary care services' },
  { locationID: '1-2687262876', mainService: 'Extra care housing services' },
  { locationID: '1-129284270', mainService: 'Hospice services' },
  {
    locationID: '1-2008736163',
    mainService:
      'Hospital services for people with mental health needs, learning disabilities and/or problems with substance misuse',
  },
  { locationID: '1-4413548038', mainService: 'Long term conditions services' },
  { locationID: '1-118864375', mainService: 'Nurses agency' },
  { locationID: '1-188270227', mainService: 'Rehabilitation services' },
  { locationID: '1-2501582617', mainService: 'Residential substance misuse treatment/ rehabilitation services' },
  { locationID: '1-2182629819', mainService: 'Shared lives' },
  { locationID: '1-112944175', mainService: 'Specialist college services' },
  { locationID: '1-1667709562', mainService: 'Supported living services' },
  { locationID: '1-6114402008', mainService: 'Community healthcare services' },
];

describe('server/routes/establishments/cqcStatus', async () => {
  describe('locationID check', async () => {
    beforeEach(() => {
      sinon.stub(CQCDataAPI, 'getWorkplaceCQCData').callsFake(async (locationID) => {
        if (locationID === registeredLocationId) {
          return registeredURLResponse;
        } else if (locationID === deregisteredLocationId) {
          return deregisteredURLResponse;
        } else if (locationID === noRegistrationStatusLocationId) {
          return noRegistrationStatusURLResponse;
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
    const noRegistrationStatusLocationId = '1-12345678';

    const registeredURLResponse = {
      registrationStatus: 'Registered',
      postalCode: 'SK10 7ED',
    };

    const noRegistrationStatusURLResponse = {
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

    it("should return a true flag is the service doesn't have a registration status", async () => {
      const request = {
        method: 'GET',
        url: `/api/cqcStatusCheck/${noRegistrationStatusLocationId}`,
        params: {
          locationID: noRegistrationStatusLocationId,
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

    it('should return a false flag if a 404 error is thrown in getWorkplaceCQCData', async () => {
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

      sinon.restore();
      sinon.stub(CQCDataAPI, 'getWorkplaceCQCData').throws({ response: { status: 404 } });

      const expectedResult = {
        cqcStatusMatch: false,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await cqcStatusCheck(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
    });

    it('should return a true flag if an unexpected error is thrown', async () => {
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

      sinon.restore();
      sinon.stub(CQCDataAPI, 'getWorkplaceCQCData').throws();

      const expectedResult = {
        cqcStatusMatch: true,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await cqcStatusCheck(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
    });
  });

  // This is a little odd but since we are relying on a third party, it's useful to check that
  // the names don't change, otherwise the mapping function is redundant.
  describe('mainService check', async () => {
    locationIDs.forEach(async (location) => {
      it(`should find ${location.locationID} and match main service`, async () => {
        const workplaceCQCData = await CQCDataAPI.getWorkplaceCQCData(location.locationID);

        const mainServiceCheck = checkMainServiceMatch(location.mainService, workplaceCQCData.gacServiceTypes);

        expect(mainServiceCheck).to.equal(true);
      });
    });

    describe('checkMainServiceMatch()', async () => {
      // For case when provider with Head office services as
      // main service (which should not have location ID) mistakenly adds a location ID
      it('should return false if no main service mapping found when converting main service to CQC', async () => {
        const location = { locationID: '1-4413548038', mainService: 'Head office services' };
        const workplaceCQCData = await CQCDataAPI.getWorkplaceCQCData(location.locationID);

        const mainServiceCheck = checkMainServiceMatch(location.mainService, workplaceCQCData.gacServiceTypes);

        expect(mainServiceCheck).to.equal(false);
      });

      it('should return true if null passed in as main service', async () => {
        const mainServiceCheck = checkMainServiceMatch(null, []);

        expect(mainServiceCheck).to.equal(true);
      });

      it('should return true if null passed in as cqcServices', async () => {
        const mainServiceCheck = checkMainServiceMatch(locationIDs[0].mainService, null);

        expect(mainServiceCheck).to.equal(true);
      });
    });
  });
});
