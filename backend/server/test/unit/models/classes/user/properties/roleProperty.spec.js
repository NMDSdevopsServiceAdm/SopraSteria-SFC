const rolePropertyClass = require('../../../../../../models/classes/user/properties/roleProperty').UserRoleProperty;

const expect = require('chai').expect;

describe('roleProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return Admin when Admin is the role in the document', async () => {
      const roleProperty = new rolePropertyClass();
      const document = {
        role: 'Admin',
      };
      await roleProperty.restoreFromJson(document);
      expect(roleProperty.property).to.deep.equal('Admin');
    });

    it('should return AdminManager when AdminManager is the role in the document', async () => {
      const roleProperty = new rolePropertyClass();
      const document = {
        role: 'AdminManager',
      };
      await roleProperty.restoreFromJson(document);
      expect(roleProperty.property).to.deep.equal('AdminManager');
    });

    it('should return Read when Read is the role in the document', async () => {
      const roleProperty = new rolePropertyClass();
      const document = {
        role: 'Read',
      };
      await roleProperty.restoreFromJson(document);
      expect(roleProperty.property).to.deep.equal('Read');
    });

    it('should return Edit when Edit is the role in the document', async () => {
      const roleProperty = new rolePropertyClass();
      const document = {
        role: 'Edit',
      };
      await roleProperty.restoreFromJson(document);
      expect(roleProperty.property).to.deep.equal('Edit');
    });

    it('should return None when None is the role in the document', async () => {
      const roleProperty = new rolePropertyClass();
      const document = {
        role: 'None',
      };
      await roleProperty.restoreFromJson(document);
      expect(roleProperty.property).to.deep.equal('None');
    });

    it('should return null if the role is not an accepted role', async () => {
      const roleProperty = new rolePropertyClass();
      const document = {
        role: 'UnknownRole',
      };
      await roleProperty.restoreFromJson(document);
      expect(roleProperty.property).to.deep.equal(null);
    });
  });
});
