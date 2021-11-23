const expect = require('chai').expect;
const sinon = require('sinon');

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

  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const shareWithProperty = new ShareWithProperty();
      const currentValue = {
        cqc: null,
        localAuthorities: true,
      };
      const newValue = {
        cqc: null,
        localAuthorities: true,
      };

      const equal = shareWithProperty.isEqual(currentValue, newValue);
      expect(equal).to.equal(true);
    });

    it('should return false if cqc has different value', () => {
      const shareWithProperty = new ShareWithProperty();
      const currentValue = {
        cqc: null,
        localAuthorities: true,
      };
      const newValue = {
        cqc: true,
        localAuthorities: true,
      };

      const equal = shareWithProperty.isEqual(currentValue, newValue);
      expect(equal).to.equal(false);
    });

    it('should return false if localAuthorities has different value', () => {
      const shareWithProperty = new ShareWithProperty();
      const currentValue = {
        cqc: true,
        localAuthorities: true,
      };
      const newValue = {
        cqc: true,
        localAuthorities: false,
      };

      const equal = shareWithProperty.isEqual(currentValue, newValue);
      expect(equal).to.equal(false);
    });

    it('should return false if field is changing from null to false', () => {
      const shareWithProperty = new ShareWithProperty();
      const currentValue = {
        cqc: null,
        localAuthorities: true,
      };
      const newValue = {
        cqc: false,
        localAuthorities: true,
      };

      const equal = shareWithProperty.isEqual(currentValue, newValue);
      expect(equal).to.equal(false);
    });
  });

  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const shareWithProperty = new ShareWithProperty();
      const shareWith = {
        cqc: true,
        localAuthorities: true,
      };
      shareWithProperty.property = shareWith;

      const json = shareWithProperty.toJSON();
      expect(json.shareWith).to.deep.equal(shareWith);
    });

    it('should return object with currentValue when showHistory is true', () => {
      const shareWithProperty = new ShareWithProperty();
      sinon.stub(shareWithProperty, 'changePropsToJSON').returns({});

      const shareWith = {
        cqc: true,
        localAuthorities: true,
      };
      shareWithProperty.property = shareWith;

      const json = shareWithProperty.toJSON(true);
      expect(json.shareWith.currentValue).to.deep.equal(shareWith);
    });
  });
});
