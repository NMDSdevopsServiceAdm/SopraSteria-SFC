const expect = require('chai').expect;
const sinon = require('sinon');

const  { UserPropertyManager } = require('../../../../../models/classes/user/userProperties');
const { PropertyManager } = require('../../../../../models/classes/properties/manager');

describe('UserPropertyManager', () => {

  describe('constructor', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should call registerProperty exactly 8 times during initialisation', () => {
      const registerSpy = sinon.stub(PropertyManager.prototype, 'registerProperty');
      new UserPropertyManager();
      expect(registerSpy.callCount).to.equal(8);
    });

    it('should call registerProperty with the correct property classes', () => {
      const registerSpy = sinon.stub(PropertyManager.prototype, 'registerProperty');
      new UserPropertyManager();

      const registeredProps = registerSpy.args.map(args => args[0]);
      const names = registeredProps.map(p => p.name);

      expect(names).to.include('UserFullnameProperty');
      expect(names).to.include('UserJobTitleProperty');
      expect(names).to.include('UserEmailProperty');
      expect(names).to.include('UserPhoneProperty');
      expect(names).to.include('UserRoleProperty');
      expect(names).to.include('UserSecurityQuestionProperty');
      expect(names).to.include('UserSecurityQuestionAnswerProperty');
      expect(names).to.include('UserUserResearchInviteResponseProperty');
    });
  });

  describe('get manager', () => {
    it('should return the property manager as an instance of the PropertyManager class', () => {
      const userPropertyManager = new UserPropertyManager();
      expect(userPropertyManager.manager).to.be.an.instanceOf(PropertyManager);
    });
  });
});