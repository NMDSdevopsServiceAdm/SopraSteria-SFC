const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const hasPermissionModule = require('../../../utils/security/hasPermission');
const { hasPermissionToUpdateProfile } = require('../../../utils/security/hasPermissionToUpdateProfile');

describe('hasPermissionToUpdateProfile', () => {
  const establishmentUid = 'mock-establishment-uid';
  const userUid = 'mock-user-uid';

  it('should allow to continue if the user is updating their own details', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/api/user/establishment/${establishmentUid}/${userUid}`,
      user: {
        id: userUid,
      },
      params: {
        id: establishmentUid,
        userId: userUid,
      },
    });
    const res = httpMocks.createResponse();
    const next = sinon.spy();

    await hasPermissionToUpdateProfile(req, res, next);

    expect(next).to.have.been.calledOnce;
  });

  it("should check for canEditUser permission if the user is updating other user's details", async () => {
    const anotherUserUid = 'mock-user-uid-another';

    sinon.stub(hasPermissionModule, 'hasPermission').returns(() => {});

    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/api/user/establishment/${establishmentUid}/${anotherUserUid}`,
      user: {
        id: userUid,
      },
      params: {
        id: establishmentUid,
        userId: anotherUserUid,
      },
    });
    const res = httpMocks.createResponse();
    const next = sinon.spy();

    await hasPermissionToUpdateProfile(req, res, next);

    expect(next).not.to.have.been.called;
    expect(hasPermissionModule.hasPermission).to.have.been.calledWith('canEditUser');
  });
});
