const expect = require('chai').expect;
const sinon = require('sinon');

const { User } = require('../../../../models/classes/user');

describe('server/models/classes/user.js', () => {
  describe('statusTranslator', () => {
    let statusTranslator;

    beforeEach(() => {
      statusTranslator = new User().statusTranslator;
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return "Pending" when a user has no login attributes', () => {
      const testUser = {};

      const result = statusTranslator(testUser);

      expect(result).to.equal('Pending');
    });

    it('should return "Active" when a user has a username but no login status', () => {
      const testUser = {
        username: 'Jimmy User',
      };

      const result = statusTranslator(testUser);

      expect(result).to.equal('Active');
    });

    it('should return the login status if it exists', () => {
      const testUser = {
        username: 'Jimmy User',
        login: {
          status: 'Another Status',
        },
      };

      const result = statusTranslator(testUser);

      expect(result).to.equal('Another Status');
    });
  });
});
