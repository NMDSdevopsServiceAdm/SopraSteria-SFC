const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');
const locationsRoute = require('../../../../../routes/locations/locationID');
const { establishmentBuilder } = require('../../../../factories/models');

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
    updatedat: new Date('2019-11-26T11:46:16.537Z'),
  },
};
const establishment = [
  {
    locationId: '1-2111759818',
  },
];

describe('locations route', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getLocations()', () => {
    it('should return locations without matching existing establishments', async () => {
      sinon.stub(models.establishment, 'findByLocationID').returns([establishment]);

      sinon.stub(models.location, 'findByLocationID').callsFake(async () => {
        return location;
      });

      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof json).to.deep.equal('object');
        expect(json.success).to.deep.equal(1);
        expect(json.searchmethod).to.deep.equal('locationID');
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
      await locationsRoute.getLocations(
        {
          params: {
            locationId: location.dataValues.locationId,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
        false,
        location.dataValues.locationId,
      );
    });

    it('should not return locations with matching existing establishments', async () => {
      sinon.stub(models.establishment, 'findByLocationID').callsFake(async () => {
        return establishment;
      });

      sinon.stub(models.location, 'findByLocationID').callsFake(async () => {
        return location;
      });

      const updateStatus = (status) => {
        expect(status).to.deep.equal(404);
      };
      const updateJson = (json) => {
        expect(typeof json).to.deep.equal('object');
        expect(json.success).to.deep.equal(0);
      };
      await locationsRoute.getLocations(
        {
          params: {
            locationId: location.dataValues.locationId,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
        true,
        location.dataValues.locationId,
      );
    });

    describe('When the user is an admin', () => {
      let expectedLocationData, establishment, locationId, req, res;

      beforeEach(() => {
        establishment = establishmentBuilder();
        locationId = 456;
        sinon.stub(models.location, 'findByLocationID').returns(null);
        sinon.stub(models.establishment, 'findByPk').returns(establishment);

        req = httpMocks.createRequest({
          method: 'GET',
          url: `/api/locations/lid/matching/${locationId}`,
          params: {
            locationId,
          },
        });

        req.role = 'Admin';
        req.establishment = {
          id: establishment.id,
        };

        res = httpMocks.createResponse();

        expectedLocationData = [
          {
            locationId: 456,
            locationName: establishment.NameValue,
            addressLine1: establishment.address1,
            addressLine2: establishment.address2,
            townCity: establishment.town,
            county: establishment.county,
            postalCode: establishment.postcode,
            mainService: establishment.mainService.name,
            isRegulated: establishment.isRegulated,
          },
        ];
      });

      describe('Admin role', () => {
        it('should return the current establishments location when location does not exist in the database', async () => {
          sinon.stub(models.establishment, 'findByLocationID').returns([]);

          await locationsRoute.getLocations(req, res, true, locationId);

          const { success, message, locationdata } = res._getJSONData();

          expect(success).to.deep.equal(1), expect(message).to.deep.equal('Location Found');
          expect(locationdata).to.deep.equal(expectedLocationData);
        });

        it('should not return a location if an establishment already exists with the location id', async () => {
          sinon.stub(models.establishment, 'findByLocationID').returns([establishment]);

          await locationsRoute.getLocations(req, res, true, locationId);

          const { success, message, locationdata } = res._getJSONData();

          expect(success).to.deep.equal(0), expect(message).to.deep.equal('No location found');
          expect(locationdata).to.deep.equal(undefined);
        });
      });

      describe('AdminManager role', () => {
        beforeEach(() => {
          req.role = 'AdminManager';
        });

        it('should return the current establishments location when location does not exist in the database', async () => {
          sinon.stub(models.establishment, 'findByLocationID').returns([]);

          await locationsRoute.getLocations(req, res, true, locationId);

          const { success, message, locationdata } = res._getJSONData();

          expect(success).to.deep.equal(1), expect(message).to.deep.equal('Location Found');
          expect(locationdata).to.deep.equal(expectedLocationData);
        });

        it('should not return a location if an establishment already exists with the location id', async () => {
          sinon.stub(models.establishment, 'findByLocationID').returns([establishment]);

          await locationsRoute.getLocations(req, res, true, locationId);

          const { success, message, locationdata } = res._getJSONData();

          expect(success).to.deep.equal(0), expect(message).to.deep.equal('No location found');
          expect(locationdata).to.deep.equal(undefined);
        });
      });
    });

    it('should return no locations if not found', async () => {
      const establishment = establishmentBuilder();
      const locationId = 456;

      sinon.stub(models.establishment, 'findByLocationID').returns(establishment);
      sinon.stub(models.location, 'findByLocationID').returns(null);
      sinon.stub(models.establishment, 'findByPk').returns(establishment);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/locations/lid/matching/${locationId}`,
        params: {
          locationId,
        },
      });

      req.establishment = {
        id: establishment.id,
      };

      const res = httpMocks.createResponse();

      await locationsRoute.getLocations(req, res, true, locationId);

      const { success, message, locationdata } = res._getJSONData();

      expect(success).to.deep.equal(0), expect(message).to.deep.equal('No location found');
      expect(locationdata).to.deep.equal(undefined);
    });
  });
});
