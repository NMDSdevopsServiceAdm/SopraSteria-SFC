const expect = require('chai').expect;

const ShareWithProperty =
  require('../../../../../../models/classes/establishment/properties/shareWithProperty').ShareWithProperty;

describe('ShareWithProperty', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async () => {
      const shareWithProperty = new ShareWithProperty();
      const document = {
        shareWith: {
          cqc: false,
          localAuthorities: true,
        },
      };

      await shareWithProperty.restoreFromJson(document);
      expect(shareWithProperty.property).to.deep.equal(document.shareWith);
    });

    it('should return null when document does not contain shareWith', async () => {
      const shareWithProperty = new ShareWithProperty();
      const document = {
        differentProperty: 'Test',
      };

      await shareWithProperty.restoreFromJson(document);
      expect(shareWithProperty.property).to.deep.equal(null);
    });
  });
});
