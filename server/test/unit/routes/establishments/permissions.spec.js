const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models');
const { permissions, permissionsCheck } = require('../../../../routes/establishments/permissions');
const buildUser = require('../../../factories/user');
const { establishmentBuilder } = require('../../../factories/models');


describe('permissions route', () => {
  const user = buildUser();
  user.created = {
    toJSON: () => {
    }
  };
  user.updated = {
    toJSON: () => {
    }
  };

  beforeEach(() => {
    sinon.stub(models.user, 'findOne').callsFake(() => {
      return user;
    });
    sinon.stub(models.establishment, 'findOne').callsFake(() => {
      return establishmentBuilder();
    });
  });

  afterEach(() => {
    sinon.restore();
  });
  function createReq(){
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${user.establishmentId}/permissions`
    });
    req.username = user.username;
    req.establishmentId = user.establishmentId;
    req.userUid = user.userUid;
    req.role = user.role;
    req.isParent = user.isParent;
    req.establishment = {
      id: user.establishmentId,
      uid: user.establishment.uid
    };
    return req;
  }
  it('should return canBecomeParent permission if no pending requests', async () => {
    sinon.stub(models.Approvals, 'findOne').callsFake(() => {
      return null;
    });

    req = createReq();
    const res = httpMocks.createResponse();

    await permissions(req, res);

    const permissionData = res._getJSONData();

    expect(res.statusCode).to.deep.equal(200);
    expect(permissionData.permissions.canBecomeAParent).to.deep.equal(true);
  });

  it('should not return canBecomeParent permission if pending requests', async () => {
    sinon.stub(models.Approvals, 'findOne').callsFake(() => {
      return {
        id: 123
      };
    });

    req = createReq();

    const res = httpMocks.createResponse();

    await permissions(req, res);

    const permissionData = res._getJSONData();

    expect(res.statusCode).to.deep.equal(200);
    expect(permissionData.permissions.canBecomeAParent).to.deep.equal(false);
  });
  describe('canViewBenchmarks', () => {

    it('should return canViewBenchmarks:true if service is one of the top 3 & regulated ', async () => {

      const req = createReq();

      const thisEstablishment = establishmentBuilder();
      thisEstablishment.mainService = { id: 25, name: 'commanMainService', isCQC: true };
      thisEstablishment.isRegulated = true;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, null, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(true);
    });
    it('should return canViewBenchmarks:false if service is one of the top 3 but not regulated ', async () => {

      const req = createReq();

      const thisEstablishment = establishmentBuilder();
      thisEstablishment.mainService = { id: 25, name: 'commanMainService', isCQC: false };
      thisEstablishment.isRegulated = false;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, null, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(false);
    });
    it('should return canViewBenchmarks:false if service is not one of the top 3 but regulated ', async () => {

      const req = createReq();

      const thisEstablishment = establishmentBuilder();
      thisEstablishment.mainService = { id: 10, name: 'NOTcommanMainService', isCQC: false };
      thisEstablishment.isRegulated = true;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, null, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(false);
    });
    it('should return canViewBenchmarks:false if service is not one of the top 3 and not regulated', async () => {

      const req = createReq();

      const thisEstablishment = establishmentBuilder();
      thisEstablishment.mainService = { id: 10, name: 'UNcommanMainService', isCQC: false };
      thisEstablishment.isRegulated = false;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, null, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(false);
    });
  });
  describe('canLinkToParent', () => {

    it('should return canLinkToParent:true if it isnt a parent,there are not any parent requests and doesnt have a parent ID ', async () => {

      const req = createReq();

      const thisEstablishment = establishmentBuilder();
      thisEstablishment.isParent = false;
      thisEstablishment.parentId = null;
      becomeAParentRequest= null;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, becomeAParentRequest, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(true);
    });
    it('should return canLinkToParent:false if it is a parent,there are not any parent requests and doesnt have a parent ID ', async () => {
      const req = createReq();
      const thisEstablishment = establishmentBuilder();
      thisEstablishment.isParent = true;
      thisEstablishment.parentId = null;
      becomeAParentRequest= null;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, becomeAParentRequest, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(false);
    });
    it('should return canLinkToParent:false if it is NOT a parent,there ARE parent requests and doesnt have a parent ID ', async () => {

      const req = createReq();
      const thisEstablishment = establishmentBuilder();
      thisEstablishment.isParent = false;
      thisEstablishment.parentId = null;
      becomeAParentRequest= {status:"pending"};

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, becomeAParentRequest, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(false);
    });
    it('should return canLinkToParent:false if it is NOT a parent,there are NO parent requests but it HAS parent ID ', async () => {

      const req = createReq();
      const thisEstablishment = establishmentBuilder();
      thisEstablishment.isParent = false;
      thisEstablishment.parentId = 201;
      becomeAParentRequest= null;

      const res = httpMocks.createResponse();

      await permissionsCheck(thisEstablishment, user, becomeAParentRequest, req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(false);
    });
    describe('canRemoveParentAssociation', () => {
      it('should return canRemoveParentAssociation:true if it isnt a parent, does have a parent ID and user had Edit permissions ', async () => {

        const req = createReq();

        const thisEstablishment = establishmentBuilder();
        thisEstablishment.isParent = false;
        thisEstablishment.parentId = 25;
        becomeAParentRequest= null;
        user.role = "Edit";
        const res = httpMocks.createResponse();

        await permissionsCheck(thisEstablishment, user, becomeAParentRequest, req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canRemoveParentAssociation).to.deep.equal(true);
      });
    });
    describe('canDownloadWdfReport', () => {
      it('should return canDownloadWdfReport:true if it is a parent, user had Edit permissions ', async () => {

        const req = createReq();

        const thisEstablishment = establishmentBuilder();
        thisEstablishment.isParent = true;
        user.role = "Edit";
        const res = httpMocks.createResponse();

        await permissionsCheck(thisEstablishment, user, null, req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canDownloadWdfReport).to.deep.equal(true);
      });
      it('should return canDownloadWdfReport:false if it is NOT a parent, user had Edit permissions ', async () => {

        const req = createReq();

        const thisEstablishment = establishmentBuilder();
        thisEstablishment.isParent = false;
        user.role = "Edit";
        const res = httpMocks.createResponse();

        await permissionsCheck(thisEstablishment, user, null, req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canDownloadWdfReport).to.deep.equal(false);
      });
      it('should return canDownloadWdfReport:false if it is a parent, user does NOT have Edit permissions ', async () => {

        const req = createReq();

        const thisEstablishment = establishmentBuilder();
        thisEstablishment.isParent = false;
        user.role = "Read";
        const res = httpMocks.createResponse();

        await permissionsCheck(thisEstablishment, user, null, req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canDownloadWdfReport).to.deep.equal(false);
      });
    });
  });
});
