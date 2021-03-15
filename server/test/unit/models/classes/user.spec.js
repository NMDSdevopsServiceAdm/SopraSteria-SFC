const expect = require('chai').expect;
const sinon = require('sinon');

const { User } = require('../../../../models/classes/user');

describe('server/models/classes/user.js', () => {
  describe('statusTranslator', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return "Pending" when login attributes are null', () => {
      const result = User.statusTranslator(null);

      expect(result).to.equal('Pending');
    });

    it('should return "Pending" when a user has empty login attributes', () => {
      const loginDetails = {};

      const result = User.statusTranslator(loginDetails);

      expect(result).to.equal('Pending');
    });

    it('should return "Active" when a user has a username but no login status', () => {
      const loginDetails = {
        username: 'Jimmy User',
      };

      const result = User.statusTranslator(loginDetails);

      expect(result).to.equal('Active');
    });

    it('should return the login status if it exists', () => {
      const loginDetails = {
        username: 'Jimmy User',
        status: 'Another Status',
      };

      const result = User.statusTranslator(loginDetails);

      expect(result).to.equal('Another Status');
    });
  });
});
