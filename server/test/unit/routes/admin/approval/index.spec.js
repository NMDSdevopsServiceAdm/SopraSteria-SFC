//   describe('approving a new workplace', () => {
//     beforeEach(async () => {
//       // For new workplace registrations, username is set to null. See onSubmit in registration.component.ts
//       testRequestBody.username = null;
//       testRequestBody.approve = true;
//     });

//     it('should return a confirmation message and status 200 when the workplace is approved', async () => {
//       // Arrange (see beforeEach)

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
//       expect(returnedJson.message).to.deep.equal(approval.workplaceApprovalConfirmation);
//       expect(returnedStatus).to.deep.equal(200);
//     });

//     it('should remove the pending status from the workplace when approving a new workplace', async () => {
//       // Arrange
//       var workplaceStatus = 'PENDING';
//       testWorkplace.update = (args) => {
//         workplaceStatus = args.ustatus;
//         return true;
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(workplaceStatus).to.deep.equal(null, "workplace should have status set to null (instead of 'PENDING')");
//     });

//     it('should update the workplace Id when approving a new workplace', async () => {
//       // Arrange
//       testRequestBody.nmdsId = testWorkplace.nmdsId.concat('X');
//       var workplaceId = testWorkplace.nmdsId;
//       testWorkplace.update = (args) => {
//         workplaceId = args.nmdsId;
//         return true;
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(workplaceId).to.deep.equal(testRequestBody.nmdsId);
//     });

//     it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new workplace', async () => {
//       // Arrange
//       workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(returnedJson.nmdsId).to.not.equal(undefined, 'returned json should have an nmdsId value');
//       expect(returnedJson.nmdsId).to.deep.equal(
//         `This workplace ID (${testWorkplace.nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
//       );
//       expect(returnedStatus).to.deep.equal(400);
//     });

//     it('should NOT remove the pending status from the workplace when approving a new workplace with duplicate workplace Id', async () => {
//       // Arrange
//       workplaceWithDuplicateId = { nmdsId: testWorkplace.nmdsId };
//       var workplaceUpdated = false;
//       testWorkplace.update = (args) => {
//         workplaceUpdated = true;
//         return true;
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(workplaceUpdated).to.equal(false, 'workplace should not have been updated');
//     });

//     it('should return status 500 if workplace update returns false when approving a new workplace', async () => {
//       // Arrange
//       testWorkplace.update = () => {
//         return false;
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(returnedStatus).to.deep.equal(500);
//     });

//     it('should return status 500 if workplace update throws exception when approving a new workplace', async () => {
//       // Arrange
//       testWorkplace.update = () => {
//         throw 'Error';
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(returnedStatus).to.deep.equal(500);
//     });
//   });

//   describe('rejecting a new workplace', () => {
//     beforeEach(async () => {
//       // For new workplace registrations, username is set to null. See onSubmit in registration.component.ts
//       testRequestBody.username = null;
//       testRequestBody.approve = false;
//     });

//     it('should return a confirmation message and status 200 when the workplace is removed because the workplace is rejected', async () => {
//       // Arrange (see beforeEach)

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(returnedJson.status).to.deep.equal('0', 'returned Json should have status 0');
//       expect(returnedJson.message).to.deep.equal(approval.workplaceRejectionConfirmation);
//       expect(returnedStatus).to.deep.equal(200);
//     });

//     it('should delete the workplace when rejecting a new workplace', async () => {
//       // Arrange
//       var workplaceDestroyed = false;
//       testWorkplace.destroy = (args) => {
//         workplaceDestroyed = true;
//         return true;
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(workplaceDestroyed).to.deep.equal(true, 'workplace should have been destroyed');
//     });

//     it('should return status 500 if it is not possible to delete a workplace when rejecting a new workplace', async () => {
//       // Arrange
//       testWorkplace.destroy = () => {
//         return false;
//       };

//       // Act
//       await approval.adminApproval(
//         {
//           body: testRequestBody,
//         },
//         { status: approvalStatus },
//       );

//       // Assert
//       expect(returnedStatus).to.deep.equal(500);
//     });
//   });
// });


const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');
const approval = require('../../../../../routes/admin/approval');

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
}


var mockUserResponse =  {
  id: 1234,
  establishment: { id: 'A1234567' },
  destroy: () => {
    return true;
  },
};

describe('adminApproval', async () => {

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
  }


  let req, res;




  afterEach(() => {
    sinon.restore();
  });

  describe('User rejection', async () => {
    beforeEach(() => {
      const request = buildRequest(false, true);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.login, 'findByUsername').returns(mockLoginResponse);
      sinon.stub(models.user, 'findByLoginId').returns(mockUserResponse);
    });

    it('should return 400 status when nmdsId already exists', async () => {
      sinon.stub(models.establishment, 'findOne').returns({ id: 'A1234567' });
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);

      const expectedResponseMessage = 'This workplace ID (A1234567) belongs to another workplace. Enter a different workplace ID.';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.include(expectedResponseMessage);
    });

    it('should return 400 status if there is no login with matching username', async () => {
      models.login.findByUsername.restore();
      sinon.stub(models.login, 'findByUsername').returns(null);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
    });

    it('should return 500 status when error is thrown', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findbyId').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return a rejection confirmation message and 200 status when user is successfully rejected', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);

      const rejectionMessage = 'User has been rejected';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.include(rejectionMessage);
    });

    it('should call the destroy method on the user when user is successfully rejected', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);

      const userDestroySpy = sinon.spy(mockUserResponse, 'destroy');

      await approval.adminApproval(req, res);

      expect(userDestroySpy.called).to.deep.equal(true);
    });

    it('should call the update method on the workplace to update the status when user is successfully rejected', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);

      const workplaceUpdateSpy = sinon.spy(mockWorkplaceResponse, 'update');

      await approval.adminApproval(req, res);


      expect(workplaceUpdateSpy.called).to.deep.equal(true);
      expect(workplaceUpdateSpy.args[0][0]).to.deep.equal({ ustatus: 'REJECTED' });
    });

    it('should return status 500 if it is not possible to delete the user when rejecting a new user', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
      sinon.stub(mockUserResponse, 'destroy').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });


  describe('User approval', async () => {
    beforeEach(() => {
      const request = buildRequest(true, true);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.login, 'findByUsername').returns(mockLoginResponse);
      sinon.stub(models.user, 'findByLoginId').returns(mockUserResponse);
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
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
      expect(workplaceUpdateSpy.args[0][0]).to.deep.equal({ ustatus: null, nmdsId: 'A1234567' });
    });


    it('should return status 500 if login update returns false when approving a new user', async () => {
      sinon.stub(mockLoginResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return status 500 if workplace update returns false when approving a new user', async () => {
      sinon.stub(mockWorkplaceResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return status 500 if login update throws error when approving a new user', async () => {
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

  describe('Workplace rejection', async () => {
    beforeEach(() => {
      const request = buildRequest(false, false);
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.establishment, 'findbyId').returns(mockWorkplaceResponse);
    });

    it('should return 400 status when nmdsId already exists', async () => {
      sinon.stub(models.establishment, 'findOne').returns({ id: 'A1234567' });

      const expectedResponseMessage = 'This workplace ID (A1234567) belongs to another workplace. Enter a different workplace ID.';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(400);
      expect(res._getData()).to.include(expectedResponseMessage);
    });

    it('should return 500 status when error is thrown when getting workplace', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      models.establishment.findbyId.restore();
      sinon.stub(models.establishment, 'findbyId').throws();

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return a rejection confirmation message and 200 status when workplace is successfully rejected', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);

      const rejectionMessage = 'Workplace has been rejected';

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getData()).to.include(rejectionMessage);
    });

    it('should call the update method on the workplace to update the status when user is successfully rejected', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);

      const workplaceUpdateSpy = sinon.spy(mockWorkplaceResponse, 'update');

      await approval.adminApproval(req, res);

      expect(workplaceUpdateSpy.called).to.deep.equal(true);
      expect(workplaceUpdateSpy.args[0][0]).to.deep.equal({ ustatus: 'REJECTED' });
    });

    it('should return 500 status when unable to update workplace when rejecting', async () => {
      sinon.stub(models.establishment, 'findOne').returns(null);
      sinon.stub(mockWorkplaceResponse, 'update').returns(false);

      await approval.adminApproval(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
