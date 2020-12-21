const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models');
const { permissions, permissionsCheck } = require('../../../../routes/establishments/permissions');
const { Establishment } = require('../../../../models/classes/establishment');
const buildUser = require('../../../factories/user');
const { establishmentBuilder } = require('../../../factories/models');
const { Establishment } = require('../../../../models/classes/establishment');

describe('permissions route', () => {
  const user = buildUser();
  user.created = {
    toJSON: () => {},
  };
  user.updated = {
    toJSON: () => {},
  };

  beforeEach(() => {
    sinon.stub(models.user, 'findOne').callsFake(() => {
      return user;
    });
    sinon.stub(Establishment.prototype, 'restore');
    sinon.stub(models.Approvals, 'becomeAParentRequests').returns(null);
  });

  afterEach(() => {
    sinon.restore();
  });
  function createReq() {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${user.establishmentId}/permissions`,
    });
    req.username = user.username;
    req.establishmentId = user.establishmentId;
    req.userUid = user.userUid;
    req.role = user.role;
    req.isParent = user.isParent;
    req.establishment = {
      id: user.establishmentId,
      uid: user.establishment.uid,
    };
    return req;
  }

  describe('canViewBenchmarks', () => {

    it('should return canViewBenchmarks:true if service is one of the top 3 & regulated ', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 25, name: 'commanMainService', isCQC: true
      });
      sinon.stub(Establishment.prototype, 'isRegulated').value(true);
      const req = {
        ...createReq(),
        username: user.username,
        role: 'Edit',
        establishment: {
          isSubsidiary: false,
          isParent: false,
        },
      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(true);
    });
    it('should return canViewBenchmarks:false if service is one of the top 3 but not regulated ', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 25, name: 'commanMainService', isCQC: false
      });
      sinon.stub(Establishment.prototype, 'isRegulated').value(false);
      const req = {
        ...createReq(),
        establishment: {
          isSubsidiary: false,
          isParent: false,
        },
      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(false);
    });
    it('should return canViewBenchmarks:false if service is not one of the top 3 but regulated ', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 10, name: 'NOTcommanMainService', isCQC: true
      });
      sinon.stub(Establishment.prototype, 'isRegulated').value(true);
      const req = {
        ...createReq(),
        establishment: {
          isSubsidiary: false,
          isParent: false,
        },
      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(false);
    });
    it('should return canViewBenchmarks:false if service is not one of the top 3 and not regulated', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 10, name: 'UNcommanMainService', isCQC: false
      });
      sinon.stub(Establishment.prototype, 'isRegulated').value(false);
      const req = {
        ...createReq(),
        establishment: {
          isSubsidiary: false,
          isParent: false,
        },
      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canViewBenchmarks).to.deep.equal(false);
    });
  });
  describe('canLinkToParent', () => {

    it('should return canLinkToParent:true if it isnt a parent,there are not any parent requests and doesnt have a parent ID ', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 10, name: 'UNcommanMainService', isCQC: false
      });
      sinon.stub(Establishment.prototype, 'isParent').value(false);
      sinon.stub(Establishment.prototype, 'parentId').value(null);
      const req = {
        ...createReq(),
        establishment: {
          isSubsidiary: false,
          isParent: false,
        },
      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(true);
    });
    it('should return canLinkToParent:false if it is a parent,there are not any parent requests and doesnt have a parent ID ', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 10, name: 'UNcommanMainService', isCQC: false
      });
      sinon.stub(Establishment.prototype, 'isParent').value(true);
      sinon.stub(Establishment.prototype, 'parentId').value(null);
      const req = {
        ...createReq(),
        establishment: {
          id:user.establishmentId,
          isSubsidiary: false,
          isParent: true,
        },
        isParent: true,

      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(false);
    });
    it('should return canLinkToParent:false if it is NOT a parent,there ARE parent requests and doesnt have a parent ID ', async () => {
      sinon.restore();

      sinon.stub(models.user, 'findOne').callsFake(() => {
        return user;
      });
      sinon.stub(Establishment.prototype, 'restore');
      sinon.stub(models.Approvals, 'becomeAParentRequests').returns({status: 'pending'});

      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 10, name: 'UNcommanMainService', isCQC: false
      });
      sinon.stub(Establishment.prototype, 'isParent').value(false);
      sinon.stub(Establishment.prototype, 'parentId').value(null);
      const req = {
        ...createReq(),
        establishment: {
          id:user.establishmentId,
          isSubsidiary: false,
          isParent: true,
        },
        isParent: true,

      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(false);
    });
    it('should return canLinkToParent:false if it is NOT a parent,there are NO parent requests but it HAS parent ID ', async () => {
      sinon.stub(Establishment.prototype, 'mainService').value({
        id: 10, name: 'UNcommanMainService', isCQC: false
      });
      sinon.stub(Establishment.prototype, 'isParent').value(false);
      sinon.stub(Establishment.prototype, 'parentId').value(201);
      const req = {
        ...createReq(),
        establishment: {
          id:user.establishmentId,
          isSubsidiary: false,
          isParent: false,
        },
        isParent: false,

      };

      const res = httpMocks.createResponse();

      await permissionsCheck(req, res);

      const permissionData = res._getJSONData();
      expect(res.statusCode).to.deep.equal(200);
      expect(permissionData.permissions.canLinkToParent).to.deep.equal(false);
    });
  });
    describe('canRemoveParentAssociation', () => {
      it('should return canRemoveParentAssociation:true if it isnt a parent, does have a parent ID and user had Edit permissions ', async () => {
        sinon.stub(Establishment.prototype, 'mainService').value({
          id: 10, name: 'UNcommanMainService', isCQC: false
        });
        sinon.stub(Establishment.prototype, 'isParent').value(false);
        sinon.stub(Establishment.prototype, 'parentId').value(25);
        const req = {
          ...createReq(),
          establishment: {
            id:user.establishmentId,
            isSubsidiary: false,
            isParent: false,
          },
          isParent: false,

        };

        const res = httpMocks.createResponse();

        await permissionsCheck(req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canRemoveParentAssociation).to.deep.equal(true);
      });
    });
    describe('canDownloadWdfReport', () => {
      it('should return canDownloadWdfReport:true if it is a parent, user had Edit permissions ', async () => {
        sinon.stub(Establishment.prototype, 'mainService').value({
          id: 10, name: 'UNcommanMainService', isCQC: false
        });
        sinon.stub(Establishment.prototype, 'isParent').value(true);
        const req = {
          ...createReq(),
          establishment: {
            id:user.establishmentId,
            isSubsidiary: false,
            isParent: true,
          },
          isParent: true,

        };

        const res = httpMocks.createResponse();

        await permissionsCheck(req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canDownloadWdfReport).to.deep.equal(true);
      });
      it('should return canDownloadWdfReport:false if it is NOT a parent, user had Edit permissions ', async () => {
        sinon.stub(Establishment.prototype, 'mainService').value({
          id: 10, name: 'UNcommanMainService', isCQC: false
        });
        sinon.stub(Establishment.prototype, 'isParent').value(false);
        const req = {
          ...createReq(),
          establishment: {
            id:user.establishmentId,
            isSubsidiary: false,
            isParent: false,
          },
          isParent: false,

        };

        const res = httpMocks.createResponse();

        await permissionsCheck(req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canDownloadWdfReport).to.deep.equal(false);
      });
      it('should return canDownloadWdfReport:false if it is a parent, user does NOT have Edit permissions ', async () => {
        sinon.stub(Establishment.prototype, 'mainService').value({
          id: 10, name: 'UNcommanMainService', isCQC: false
        });
        sinon.stub(Establishment.prototype, 'isParent').value(false);
        const req = {
          ...createReq(),
          role: 'Read',
          establishment: {
            id:user.establishmentId,
            isSubsidiary: false,
            isParent: false,
          },
          isParent: false,

        };

        const res = httpMocks.createResponse();

        await permissionsCheck(req, res);

        const permissionData = res._getJSONData();
        expect(res.statusCode).to.deep.equal(200);
        expect(permissionData.permissions.canDownloadWdfReport).to.deep.equal(false);
      });
    });

  });
