const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../models');
const locationsRoute = require('../../../../../routes/locations/postcode');

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

  describe('getLocationsByPostcode()', () => {
    it('should return locations without matching existing establishments', async () => {
      sinon.stub(models.location, 'findByPostcode').callsFake(async (args) => {
        return [location];
      });

      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof json).to.deep.equal('object');
        expect(json.success).to.deep.equal(1);
        expect(Array.isArray(json.locationdata)).to.deep.equal(true);
        expect(json.locationdata.length).to.deep.equal(1);
        expect(json.searchmethod).to.deep.equal('postcode');
        expect(json.locationdata[0].locationId).to.deep.equal(location.dataValues.locationid);
        expect(json.locationdata[0].locationName).to.deep.equal(location.dataValues.locationname);
        expect(json.locationdata[0].addressLine1).to.deep.equal(location.dataValues.addressline1);
        expect(json.locationdata[0].addressLine2).to.deep.equal(location.dataValues.addressline2);
        expect(json.locationdata[0].addressLine3).to.deep.equal(location.dataValues.addressline3);
        expect(json.locationdata[0].townCity).to.deep.equal(location.dataValues.towncity);
        expect(json.locationdata[0].county).to.deep.equal(location.dataValues.county);
        expect(json.locationdata[0].mainService).to.deep.equal(location.dataValues.mainservice);
      };
      await locationsRoute.getLocationsByPostcode(
        {
          params: {
            postcode: location.dataValues.postalcode,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
        false,
        location.dataValues.postalcode,
      );
    });
    it('should not return locations with matching existing establishments', async () => {
      sinon.stub(models.establishment, 'findEstablishmentsByLocationID').callsFake(async (args) => {
        return establishment;
      });

      sinon.stub(models.location, 'findByPostcode').callsFake(async (args) => {
        return [location];
      });

      const updateStatus = (status) => {
        expect(status).to.deep.equal(404);
      };
      const updateJson = (json) => {
        expect(typeof json).to.deep.equal('object');
        expect(json.success).to.deep.equal(0);
      };
      await locationsRoute.getLocationsByPostcode(
        {
          params: {
            postcode: location.dataValues.postalcode,
          },
        },
        { status: updateStatus, json: updateJson, send: updateJson },
        true,
        location.dataValues.postalcode,
      );
    });
  });
});
