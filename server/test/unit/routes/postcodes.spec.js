const expect = require('chai').expect;
const sinon = require('sinon');
const postcodes = require('../../../routes/postcodes');
const models = require('../../../models');
const httpMocks = require('node-mocks-http');

describe('postcodes', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createAddressObject', async () => {
    it('sets building number and street description as addressLine1 in correct format when they exist and no building/sub name', () => {
      const data = {
        uprn: '100010824271',
        sub_building_name: '',
        building_name: '',
        building_number: '91',
        street_description: 'DRURY LANE',
        post_town: 'LONDON',
        postcode: 'SW1 1AA',
        local_custodian_code: '1000',
        county: 'GREATER LONDON',
        rm_organisation_name: '',
      };

      const result = postcodes.createAddressObject(data);

      expect(result.addressLine1).to.equal('91 DRURY LANE');
      expect(result.addressLine2).to.equal('');
      expect(result.addressLine3).to.equal('');
    });

    it('sets the building name as addressLine1 and street description as addressLine2 when there is no building number', () => {
      const data = {
        uprn: '100010824271',
        sub_building_name: '',
        building_name: 'THE TEST CENTRE',
        building_number: '',
        street_description: 'DRURY LANE',
        post_town: 'LONDON',
        postcode: 'SW1 1AA',
        local_custodian_code: '1000',
        county: 'GREATER LONDON',
        rm_organisation_name: '',
      };

      const result = postcodes.createAddressObject(data);

      expect(result.addressLine1).to.equal('THE TEST CENTRE');
      expect(result.addressLine2).to.equal('DRURY LANE');
      expect(result.addressLine3).to.equal('');
    });

    it('sets the sub building name as addressLine1 and building name as addressLine2 when they both exist', () => {
      const data = {
        uprn: '100010824271',
        sub_building_name: 'UNIT 1',
        building_name: 'THE TEST CENTRE',
        building_number: '',
        street_description: 'DRURY LANE',
        post_town: 'LONDON',
        postcode: 'SW1 1AA',
        local_custodian_code: '1000',
        county: 'GREATER LONDON',
        rm_organisation_name: '',
      };

      const result = postcodes.createAddressObject(data);

      expect(result.addressLine1).to.equal('UNIT 1');
      expect(result.addressLine2).to.equal('THE TEST CENTRE');
      expect(result.addressLine3).to.equal('DRURY LANE');
    });
  });

  describe('getAddressesWithPostcode', async () => {
    it('returns a 200 when addresses are found', async () => {
      const request = {
        method: 'GET',
        url: '/api/postcodes',
        params: {
          postcode: 'SW1 1AA',
        },
      };

      const foundAddresses = [
        {
          dataValues: {
            uprn: '100010824271',
            sub_building_name: '',
            building_name: '',
            building_number: '91',
            street_description: 'DRURY LANE',
            post_town: 'LONDON',
            postcode: 'SW1 1AA',
            local_custodian_code: '1000',
            county: 'GREATER LONDON',
            rm_organisation_name: '',
          },
        },
        {
          dataValues: {
            uprn: '100010824271',
            sub_building_name: '',
            building_name: '',
            building_number: '92',
            street_description: 'DRURY LANE',
            post_town: 'LONDON',
            postcode: 'SW1 1AA',
            local_custodian_code: '1000',
            county: 'GREATER LONDON',
            rm_organisation_name: '',
          },
        },
      ];

      sinon.stub(models.pcodedata, 'findAll').returns(foundAddresses);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await postcodes.getAddressesWithPostcode(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('returns a 404 when no addresses are found', async () => {
      const request = {
        method: 'GET',
        url: '/api/postcodes',
        params: {
          postcode: 'SW1 1AA',
        },
      };

      const foundAddresses = [];

      sinon.stub(models.pcodedata, 'findAll').returns(foundAddresses);

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await postcodes.getAddressesWithPostcode(req, res);
      expect(res.statusCode).to.deep.equal(404);
    });
  });
});
