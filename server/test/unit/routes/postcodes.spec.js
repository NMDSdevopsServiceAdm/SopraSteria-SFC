const expect = require('chai').expect;
const sinon = require('sinon');
const createAddressObject = require('../../../routes/postcodes').createAddressObject;

describe('postcodes', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createAddressObject', async () => {
    it('returns building number and street description in correct format', async () => {
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

      const result = await createAddressObject(data);

      expect(result.addressLine1).to.equal('91 DRURY LANE');
      expect(result.addressLine2).to.equal('');
    });
  });
});
