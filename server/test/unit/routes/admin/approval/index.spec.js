/* eslint-disable no-unused-vars */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');
const approval = require('../../../../../routes/admin/approval');

const buildRequest = (isApproval, isNewUserRegistration) => {
  const request = {
    method: 'POST',
    url: '/api/admin/approval',
    body: {
      nmdsId: 'A1234567',
      approve: isApproval,
    },
  };

  if (isNewUserRegistration) {
    request.body.username = 'test_user';
  } else {
    request.body.establishmentId = '1311';
  }
  return request;
};

const mockLoginResponse = {
  id: 123,
  username: 'test_user',
  user: { establishmentId: '1331' },
  isActive: false,
  status: 'PENDING',
  update: (args) => {
    return true;
  },
};

const mockWorkplaceResponse = {
  id: 4321,
  nmdsId: 'W1234567',
  ustatus: 'PENDING',
  update: (args) => {
    return true;
  },
  destroy: () => {
    return true;
  },
};

const mockUserResponse = {
  id: 1234,
  establishment: { id: 'A1234567' },
  destroy: () => {
    return true;
  },
};

describe('adminApproval', async () => {
  let req, res;

  afterEach(() => {
    sinon.restore();
  });

  describe('User approval', async () => {
    beforeEach(() => {
      const request = buildRequest(true, true);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.login, 'findByUsername').returns(mockLoginResponse);
      sinon.stub(models.user, 'findByLoginId').returns(mockUserResponse);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns(null);
    });

    it('should return a confirmation message and status 200 when the user is approved', async () => {
      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.include(approval.userApprovalConfirmation);
    });

    it('should mark the login as active and set status to null when approving a new user', async () => {
      const loginUpdateSpy = sinon.spy(mockLoginResponse, 'update');

      await approval.adminApproval(req, res);

      expect(loginUpdateSpy.called).to.deep.equal(true);
      expect(loginUpdateSpy.args[0][0]).to.deep.equal({ status: null, isActive: true });
    });

    it('should update the workplace nmdsId and ustatus when approving a new user', async () => {
      const workplaceUpdateSpy = sinon.spy(mockWorkplaceResponse, 'update');

      await approval.adminApproval(req, res);

      expect(workplaceUpdateSpy.called).to.deep.equal(true);
      expect(workplaceUpdateSpy.args[0][0]).to.deep.equal({
        inReview: false,
        reviewer: null,
        ustatus: null,
        nmdsId: 'A1234567',
      });
    });

    it('should return status 500 if login update returns false when approving a new user', async () => {
      sinon.stub(mockLoginResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 500 status if workplace update returns false when approving a new user', async () => {
      sinon.stub(mockWorkplaceResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 500 status if login update throws error when approving a new user', async () => {
      sinon.stub(mockLoginResponse, 'update').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return status 500 if workplace update throws error when approving a new user', async () => {
      sinon.stub(mockWorkplaceResponse, 'update').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('User rejection', async () => {
    beforeEach(() => {
      const request = buildRequest(false, true);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.login, 'findByUsername').returns(mockLoginResponse);
      sinon.stub(models.user, 'findByLoginId').returns(mockUserResponse);
      sinon.stub(models.user, 'findByUUID').returns({ FullNameValue: 'Joe Bloggs' });
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns(null);
    });

    it('should return a rejection confirmation message and 200 status when user is successfully rejected', async () => {
      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.include(approval.userRejectionConfirmation);
    });

    it('should call the destroy method on the user when user is successfully rejected', async () => {
      const userDestroySpy = sinon.spy(mockUserResponse, 'destroy');

      await approval.adminApproval(req, res);

      expect(userDestroySpy.called).to.deep.equal(true);
    });

    it('should call the update method on the workplace to update the status when user is successfully rejected', async () => {
      const workplaceUpdateSpy = sinon.spy(mockWorkplaceResponse, 'update');

      await approval.adminApproval(req, res);

      expect(workplaceUpdateSpy.called).to.deep.equal(true);
      expect(workplaceUpdateSpy.args[0][0]).to.contain({
        ustatus: 'REJECTED',
        inReview: false,
        reviewer: null,
        updatedBy: 'Joe Bloggs',
        archived: true,
      });
    });

    it('should return status 500 if it is not possible to delete the user when rejecting a new user', async () => {
      sinon.stub(mockUserResponse, 'destroy').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 400 status if there is no login with matching username', async () => {
      models.login.findByUsername.restore();
      sinon.stub(models.login, 'findByUsername').returns(null);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
    });

    it('should return 400 status when nmdsId already exists', async () => {
      models.establishment.findEstablishmentWithSameNmdsId.restore();
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns({ id: 'A1234567' });

      const expectedResponseMessage =
        'This workplace ID (A1234567) belongs to another workplace. Enter a different workplace ID.';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.include(expectedResponseMessage);
    });

    it('should return 500 status when error is thrown', async () => {
      models.establishment.findbyId.restore();
      sinon.stub(models.establishment, 'findbyId').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('Workplace approval', async () => {
    beforeEach(() => {
      const request = buildRequest(true, false);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns(null);
    });

    it('should return an approval confirmation message and 200 status when workplace is successfully approved', async () => {
      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.include(approval.workplaceApprovalConfirmation);
    });

    it('should call the update method on the workplace to update status when workplace is successfully approved', async () => {
      const workplaceUpdateSpy = sinon.spy(mockWorkplaceResponse, 'update');

      await approval.adminApproval(req, res);

      expect(workplaceUpdateSpy.called).to.deep.equal(true);
      expect(workplaceUpdateSpy.args[0][0]).to.deep.equal({
        inReview: false,
        reviewer: null,
        ustatus: null,
        nmdsId: 'A1234567',
      });
    });

    it('should return 500 status when unable to update workplace when approving', async () => {
      sinon.stub(mockWorkplaceResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 400 status when nmdsId already exists', async () => {
      models.establishment.findEstablishmentWithSameNmdsId.restore();
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns({ id: 'A1234567' });

      const expectedResponseMessage =
        'This workplace ID (A1234567) belongs to another workplace. Enter a different workplace ID.';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.include(expectedResponseMessage);
    });

    it('should return 500 status when error is thrown when getting workplace', async () => {
      models.establishment.findbyId.restore();
      sinon.stub(models.establishment, 'findbyId').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('Workplace rejection', async () => {
    beforeEach(() => {
      const request = buildRequest(false, false);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.user, 'findByUUID').returns({ FullNameValue: 'Joe Bloggs' });
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns(null);
    });

    it('should return a rejection confirmation message and 200 status when workplace is successfully rejected', async () => {
      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.include(approval.workplaceRejectionConfirmation);
    });

    it('should call the update method on the workplace to update the status when workplace is successfully rejected', async () => {
      const workplaceUpdateSpy = sinon.spy(mockWorkplaceResponse, 'update');

      await approval.adminApproval(req, res);

      expect(workplaceUpdateSpy.called).to.deep.equal(true);
      expect(workplaceUpdateSpy.args[0][0]).to.contain({
        ustatus: 'REJECTED',
        inReview: false,
        reviewer: null,
        updatedBy: 'Joe Bloggs',
      });
      expect(workplaceUpdateSpy.args[0][0]).to.haveOwnProperty('updated');
    });

    it('should return 500 status when unable to update workplace when rejecting', async () => {
      sinon.stub(mockWorkplaceResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 400 status when nmdsId already exists', async () => {
      models.establishment.findEstablishmentWithSameNmdsId.restore();
      sinon.stub(models.establishment, 'findEstablishmentWithSameNmdsId').returns({ id: 'A1234567' });

      const expectedResponseMessage =
        'This workplace ID (A1234567) belongs to another workplace. Enter a different workplace ID.';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.include(expectedResponseMessage);
    });

    it('should return 500 status when error is thrown when getting workplace', async () => {
      models.establishment.findbyId.restore();
      sinon.stub(models.establishment, 'findbyId').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
