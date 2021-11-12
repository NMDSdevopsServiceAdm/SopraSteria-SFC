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

  describe('restorePropertyFromSequelize()', () => {
    it('should restore in shareWith format with cqc and localAuthorities fields', () => {
      const shareWithProperty = new ShareWithProperty();
      const document = {
        shareWithCQC: false,
        shareWithLA: true,
      };

      const expectedShareWith = {
        cqc: false,
        localAuthorities: true,
      };

      const restored = shareWithProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(expectedShareWith);
    });

    it('should restore in shareWith format when properties are null', () => {
      const shareWithProperty = new ShareWithProperty();
      const document = {
        shareWithCQC: null,
        shareWithLA: null,
      };

      const expectedShareWith = {
        cqc: null,
        localAuthorities: null,
      };

      const restored = shareWithProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(expectedShareWith);
    });
  });

  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const shareWithProperty = new ShareWithProperty();
      const shareWith = {
        cqc: null,
        localAuthorities: true,
      };

      const expectedSaved = {
        shareWithCQC: null,
        shareWithLA: true,
      };
      shareWithProperty.property = shareWith;

      const saved = shareWithProperty.savePropertyToSequelize();
      expect(saved).to.deep.equal(expectedSaved);
    });

    it('should still save in correct format as if saving into database when values are null', () => {
      const shareWithProperty = new ShareWithProperty();
      const shareWith = {
        cqc: null,
        localAuthorities: null,
      };

      const expectedSaved = {
        shareWithCQC: null,
        shareWithLA: null,
      };
      shareWithProperty.property = shareWith;

      const saved = shareWithProperty.savePropertyToSequelize();
      expect(saved).to.deep.equal(expectedSaved);
    });
  });
});
