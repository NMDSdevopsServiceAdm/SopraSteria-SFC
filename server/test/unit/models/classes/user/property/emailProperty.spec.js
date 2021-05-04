const expect = require('chai').expect;

const emailPropertyClass = require('../../../../../../models/classes/user/properties/emailProperty').UserEmailProperty;

describe('emailProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should not allow emails over 120 characters', async () => {
      const emailProperty = new emailPropertyClass();
      const document = {
        email:
          'ogiwghiwgjirjgirgnirehgireingirehgjkrhgiruehgriehgirhgrkjhgiorehgiorehgerio@jkgrengjrnbguirebnlkjnlknklnklniiobiobojuigbreuibgubgurbger.com',
      };
      await emailProperty.restoreFromJson(document);
      expect(emailProperty.property).to.deep.equal(null);
    });

    it('should allow emails with a common tld', async () => {
      const emailProperty = new emailPropertyClass();
      const document = {
        email: 'example@email.com',
      };
      await emailProperty.restoreFromJson(document);
      expect(emailProperty.property).to.deep.equal(document.email);
    });

    it('should allow emails with a longer not common tld', async () => {
      const emailProperty = new emailPropertyClass();
      const document = {
        email: 'example@email.support',
      };
      await emailProperty.restoreFromJson(document);
      expect(emailProperty.property).to.deep.equal(document.email);
    });
  });
});
