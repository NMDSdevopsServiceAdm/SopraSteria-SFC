const expect = require('chai').expect;

const setInactiveWorkplacesForDeletion = require('../../../../../services/email-campaigns/inactive-workplaces/setInactiveWorkplacesForDeletion');

describe('server/services/email-campaigns/inactive-workplaces/setInactiveWorkplacesForDeletion', () => {
  describe('formattedAddress', () => {
    it('should return the concatenated full address', () => {
      const data = {
        Address1: '55 KNIGHTS AVENUE',
        Town: 'BEDFORD',
        County: 'LEEDS',
        PostCode: 'MK41 6DG',
      };
      const address = setInactiveWorkplacesForDeletion.formattedAddress(data);

      expect(address).to.equal('55 KNIGHTS AVENUE BEDFORD LEEDS MK41 6DG');
    });

    it("should return the concatenated address without any undefined's when the address has undefined values", () => {
      const data = {
        Address1: '55 KNIGHTS AVENUE',
        Town: undefined,
        County: undefined,
        PostCode: 'MK41 6DG',
      };
      const address = setInactiveWorkplacesForDeletion.formattedAddress(data);
      expect(address).to.equal('55 KNIGHTS AVENUE MK41 6DG');
    });

    it("should return the concatenated address without any null's when the address has null values", () => {
      const data = {
        Address1: '55 KNIGHTS AVENUE',
        Town: null,
        County: null,
        PostCode: 'MK41 6DG',
      };
      const address = setInactiveWorkplacesForDeletion.formattedAddress(data);
      expect(address).to.equal('55 KNIGHTS AVENUE MK41 6DG');
    });
  });
});
