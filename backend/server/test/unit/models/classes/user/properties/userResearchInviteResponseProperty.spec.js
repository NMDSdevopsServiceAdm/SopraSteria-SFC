const expect = require('chai').expect;
const sinon = require('sinon');

const userResearchInviteResponsePropertyClass = require('../../../../../../models/classes/user/properties/userResearchInviteResponseProperty').UserUserResearchInviteResponseProperty;

describe('UserResearchInviteResponseProperty', () => {
  describe('restoreFromJson', () => {
    it('should set the property to yes when a yes value is passed in', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      const document = {
        userResearchInviteResponse:
          'Yes',
      };
      await userResearchInviteResponseProperty.restoreFromJson(document);
      expect(userResearchInviteResponseProperty.property).to.deep.equal('Yes');
    });

    it('should set the property to null when a null value is passed in', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      const document = {
        userResearchInviteResponse: null,
      };
      await userResearchInviteResponseProperty.restoreFromJson(document);
      expect(userResearchInviteResponseProperty.property).to.deep.equal(null);
    });
  });

  describe('restorePropertyFromSequelize', () => {
    it('should restore the value as yes when that value is passed in', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      const document = {
        UserResearchInviteResponseValue: 'Yes',
      };

      const restored = userResearchInviteResponseProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal('Yes');
    });

    it('should restore the value as null when that value is passed in', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      const document = {
        UserResearchInviteResponseValue: null,
      };

      const restored = userResearchInviteResponseProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(null);
    });
  });

  describe('savePropertyToSequelize', () => {
    it('should save the value as yes when that value is passed in', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      userResearchInviteResponseProperty.property = 'Yes';

      const result = userResearchInviteResponseProperty.savePropertyToSequelize()
      expect(result).to.deep.equal({ UserResearchInviteResponseValue: 'Yes'} );
    });

    it('should restore the value as null when that value is passed in', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      userResearchInviteResponseProperty.property = null;

      const result = userResearchInviteResponseProperty.savePropertyToSequelize();
      expect(result).to.deep.equal({ UserResearchInviteResponseValue: null });
    });
  });

  describe('isEqual', () => {
    it('should return true when both parameters are yes', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();

      const result = userResearchInviteResponseProperty.isEqual('Yes', 'Yes')
      expect(result).to.deep.equal(true);
    });

    it('should return true when both parameters are null', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();

      const result = userResearchInviteResponseProperty.isEqual(null, null)
      expect(result).to.deep.equal(true);
    });

    it('should return false when parameters are yes and no', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();

      const result = userResearchInviteResponseProperty.isEqual('Yes', 'No')
      expect(result).to.deep.equal(false);
    });

    it('should return false when parameters are null and yes', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();

      const result = userResearchInviteResponseProperty.isEqual(null, 'Yes')
      expect(result).to.deep.equal(false);
    });
  });

  describe('toJSON', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return only the property when withHistory is false', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      const changePropsToJSONSpy = sinon.spy(userResearchInviteResponseProperty, 'changePropsToJSON');

      const result = userResearchInviteResponseProperty.toJSON(false, true)
      expect(result).to.deep.equal({ userResearchInviteResponse: null });
      expect(changePropsToJSONSpy.notCalled).to.equal(true);
    });

    it('should return property history when withHistory is true', async () => {
      const userResearchInviteResponseProperty = new userResearchInviteResponsePropertyClass();
      const changePropsToJSONSpy = sinon.spy(userResearchInviteResponseProperty, 'changePropsToJSON');

      const result = userResearchInviteResponseProperty.toJSON(true, true)
      expect(changePropsToJSONSpy.calledOnceWith(true)).to.equal(true);
      expect(result).to.deep.equal({
        userResearchInviteResponse: {
          currentValue: null,
          lastChanged: null,
          lastChangedBy: null,
          lastSaved: null,
          lastSavedBy: null,
        }
      });
    });
  });
});