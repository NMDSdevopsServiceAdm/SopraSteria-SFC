const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../models/index');
const locationsRoute = require('../../../routes/locations');

const location = {
  dataValues: {
    locationid: '1-2111759818',
    locationname: 'Welcombe Care Limited',
    addressline1: 'Arden Medical Centre',
    addressline2: 'Albany Road',
    towncity: 'Stratford Upon Avon',
    county: 'Warwickshire',
    postalcode: 'CV37 6PG',
    mainservice: 'Homecare agencies',
    createdat: new Date('2019-02-12T09:43:29.932Z'),
    updatedat: new Date('2019-11-26T11:46:16.537Z')
  }
};
const establishment = [{
    locationId: '1-2111759818'
}];

describe('locations route', () => {
  beforeEach(() => {
    sinon.stub(models.location, 'findOne').callsFake(async (args) => {
      return location;
    });
    sinon.stub(models.location, 'findAll').callsFake(async (args) => {
      return [location];
    });
    sinon.stub(models.establishment, 'findAll').callsFake(async (args) => {
      return establishment;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe.only('getLocations()', () => {
    it('should return locations without matching existing establishments', async() => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.success).to.deep.equal(1);
        expect(Array.isArray(json.locationdata)).to.deep.equal(true);
        expect(json.locationdata.length).to.deep.equal(1);
        expect(json.locationdata[0].locationId).to.deep.equal(location.dataValues.locationid);
        expect(json.locationdata[0].locationName).to.deep.equal(location.dataValues.locationname);
        expect(json.locationdata[0].addressLine1).to.deep.equal(location.dataValues.addressline1);
        expect(json.locationdata[0].addressLine2).to.deep.equal(location.dataValues.addressline2);
        expect(json.locationdata[0].addressLine3).to.deep.equal(location.dataValues.addressline3);
        expect(json.locationdata[0].townCity).to.deep.equal(location.dataValues.towncity);
        expect(json.locationdata[0].county).to.deep.equal(location.dataValues.county);
        expect(json.locationdata[0].mainService).to.deep.equal(location.dataValues.mainservice);
      };
      await locationsRoute.getLocations({
        params: {
          locationId: location.dataValues.locationId
        }
      }, {status: updateStatus, json: updateJson, send: updateJson}, false);
    });
    it('should not return locations with matching existing establishments', async() => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(404);
      };
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.success).to.deep.equal(0);;
      };
      await locationsRoute.getLocations({
        params: {
          locationId: location.dataValues.locationId
        }
      }, {status: updateStatus, json: updateJson, send: updateJson}, true);
    });

    it('should return a non existent location if the user is an admin', async () => {
      const establishmentId = 123;
      const locationId = 456;

      sinon.stub(models.establishment, 'findByPk').callsFake(async (args) => {
        return {
          NameValue: 'Test Workplace',
          address1: '63 Skills for Care Lane',
          address2: '',
          town: 'Leeds',
          county: 'North West',
          postcode: 'LS1 3BE',
          isRegulated: '123',
          mainService: {
            name: '123',
          },
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/locations/lid/matching/${locationId}`,
        params: {
          locationId,
        }
      });

      req.role = 'Admin';
      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      await locationsRoute.getLocations(req, res, true);

      const { success, message, locationdata } = res._getJSONData();

      expect(success).to.deep.equal(1),
      expect(message).to.deep.equal(`No location found but defaulting to the workplace's current location due to the user being an admin`);
      expect(locationdata).to.deep.equal([{
        locationId: 456,
        locationName: 'Test Workplace',
        addressLine1: '63 Skills for Care Lane',
        addressLine2: '',
        townCity: 'Leeds',
        county: 'North West',
        postalCode: 'LS1 3BE',
        mainService: '123',
        isRegulated: '123',
      }]);
    });

    it('should return no locations if not found', async () => {
      const establishmentId = 123;
      const locationId = 456;

      sinon.stub(models.establishment, 'findByPk').callsFake(async (args) => {
        return {
          NameValue: 'Test Workplace',
          address1: '63 Skills for Care Lane',
          address2: '',
          town: 'Leeds',
          county: 'North West',
          postcode: 'LS1 3BE',
          isRegulated: '123',
          mainService: {
            name: '123',
          },
        };
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/locations/lid/matching/${locationId}`,
        params: {
          locationId,
        }
      });

      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

      await locationsRoute.getLocations(req, res, true);

      const { success, message, locationdata } = res._getJSONData();

      expect(success).to.deep.equal(0),
      expect(message).to.deep.equal('No location found');
      expect(locationdata).to.deep.equal(undefined);
    });
  });

  describe('getLocationsByPostcode()', () => {
    it('should return locations without matching existing establishments', async() => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.success).to.deep.equal(1);
        expect(Array.isArray(json.locationdata)).to.deep.equal(true);
        expect(json.locationdata.length).to.deep.equal(1);
        expect(json.locationdata[0].locationId).to.deep.equal(location.dataValues.locationid);
        expect(json.locationdata[0].locationName).to.deep.equal(location.dataValues.locationname);
        expect(json.locationdata[0].addressLine1).to.deep.equal(location.dataValues.addressline1);
        expect(json.locationdata[0].addressLine2).to.deep.equal(location.dataValues.addressline2);
        expect(json.locationdata[0].addressLine3).to.deep.equal(location.dataValues.addressline3);
        expect(json.locationdata[0].townCity).to.deep.equal(location.dataValues.towncity);
        expect(json.locationdata[0].county).to.deep.equal(location.dataValues.county);
        expect(json.locationdata[0].mainService).to.deep.equal(location.dataValues.mainservice);
      };
      await locationsRoute.getLocationsByPostcode({
        params: {
          postcode: location.dataValues.postalcode
        }
      }, {status: updateStatus, json: updateJson, send: updateJson}, false);
    });
    it('should not return locations with matching existing establishments', async() => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(404);
      };
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.success).to.deep.equal(0);;
      };
      await locationsRoute.getLocationsByPostcode({
        params: {
          postcode: location.dataValues.postalcode
        }
      }, {status: updateStatus, json: updateJson, send: updateJson}, true);
    });
  });
});
