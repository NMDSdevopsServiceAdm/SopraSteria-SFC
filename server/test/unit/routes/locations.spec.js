const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../models/index');
const locationsRoute = require('../../../routes/locations');
const { establishmentBuilder } = require('../../factories/models');

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
  afterEach(() => {
    sinon.restore();
  });

  describe('getLocations()', () => {
    it('should return locations without matching existing establishments', async() => {
      sinon.stub(models.establishment, 'findAll').returns([establishment]);

      sinon.stub(models.location, 'findOne').callsFake(async (args) => {
        return location;
      });

      sinon.stub(models.location, 'findAll').callsFake(async (args) => {
        return [location];
      });

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
      sinon.stub(models.establishment, 'findAll').callsFake(async (args) => {
        return establishment;
      });

      sinon.stub(models.location, 'findOne').callsFake(async (args) => {
        return location;
      });

      sinon.stub(models.location, 'findAll').callsFake(async (args) => {
        return [location];
      });

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

    describe('when the user is an admin and the location does not exist in the database', () => {
      it('should return the current establishments location', async () => {
        const establishment = establishmentBuilder();
        const locationId = 456;

        sinon.stub(models.establishment, 'findAll').returns([]);
        sinon.stub(models.location, 'findOne').returns(null);
        sinon.stub(models.establishment, 'findByPk').returns(establishment)

        const req = httpMocks.createRequest({
          method: 'GET',
          url: `/api/locations/lid/matching/${locationId}`,
          params: {
            locationId,
          }
        });

        req.role = 'Admin';
        req.establishment = {
          id: establishment.id,
        };

        const res = httpMocks.createResponse();

        await locationsRoute.getLocations(req, res, true);

        const { success, message, locationdata } = res._getJSONData();

        expect(success).to.deep.equal(1),
        expect(message).to.deep.equal('Location Found');
        expect(locationdata).to.deep.equal([{
          locationId: 456,
          locationName: establishment.NameValue,
          addressLine1: establishment.address1,
          addressLine2: establishment.address2,
          townCity: establishment.town,
          county: establishment.county,
          postalCode: establishment.postcode,
          mainService: establishment.mainService.name,
          isRegulated: establishment.isRegulated,
        }]);
      });

      it('should not return a location if an establishment already exists with the location id', async () => {
        const establishment = establishmentBuilder();
        const locationId = 456;

        sinon.stub(models.establishment, 'findAll').returns([establishment]);
        sinon.stub(models.location, 'findOne').returns(null);
        sinon.stub(models.establishment, 'findByPk').returns(establishment)

        const req = httpMocks.createRequest({
          method: 'GET',
          url: `/api/locations/lid/matching/${locationId}`,
          params: {
            locationId,
          }
        });

        req.role = 'Admin';
        req.establishment = {
          id: establishment.id,
        };

        const res = httpMocks.createResponse();

        await locationsRoute.getLocations(req, res, true);

        const { success, message, locationdata } = res._getJSONData();

        expect(success).to.deep.equal(0),
        expect(message).to.deep.equal('No location found');
        expect(locationdata).to.deep.equal(undefined);
      });
    });

    it('should return no locations if not found', async () => {
      const establishment = establishmentBuilder();
      const locationId = 456;

      sinon.stub(models.establishment, 'findAll').returns(establishment);
      sinon.stub(models.location, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findByPk').returns(establishment);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/locations/lid/matching/${locationId}`,
        params: {
          locationId,
        }
      });

      req.establishment = {
        id: establishment.id,
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
      sinon.stub(models.location, 'findOne').callsFake(async (args) => {
        return location;
      });

      sinon.stub(models.location, 'findAll').callsFake(async (args) => {
        return [location];
      });

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
