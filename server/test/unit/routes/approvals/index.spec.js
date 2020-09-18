const models = require('../../../../models/index');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const expect = require('chai').expect;
const { getApprovalRequest } = require('../../../../routes/approvals/index');
const sinon_sandbox = sinon.createSandbox();
const faker = require('faker');
const moment = require('moment-timezone');
const config = require('../../../../config/config');

var testWorkplace = {};
var workplaceObjectWasSaved = false;
const _initialiseTestWorkplace = () => {
  testWorkplace.id = 4321;
  testWorkplace.isParent = false;
  testWorkplace.nmdsId = 'I1234567';
  testWorkplace.NameValue = faker.lorem.words(4);
  testWorkplace.save = () => {
    workplaceObjectWasSaved = true;
  };
};

var testUser = {};
const _initialiseTestUser = () => {
  testUser.id = 1234;
};

var approvalObjectWasSaved = false;
var fakeApproval = {
  ID: 9,
  UUID: 'bbd54f18-f0bd-4fc2-893d-e492faa9b278',
  EstablishmentID: testWorkplace.id,
  UserID: testUser.id,
  createdAt: '2020-05-18 09:25:12.896+01',
  Status: 'Pending',
  Establishment: {
    uid: 'f61696f7-30fe-441c-9c59-e25dfcb51f59',
    nmdsId: testWorkplace.nmdsId,
    NameValue: testWorkplace.NameValue,
  },
  User: {
    FullNameValue: faker.name.findName(),
  },
  Data: {
    requestedService: {
      id: 1,
      name: 'Carers support',
      other: 'Other requested service Name',
    },
    currentService: {
      id: 14,
      name: 'Any childrens / young peoples services',
      other: 'Other Name',
    },
  },
  save: () => {
    approvalObjectWasSaved = true;
  },
};

var returnedJson = null;
var returnedStatus = null;
const parentRequestJson = (json) => {
  returnedJson = json;
};
const parentRequestStatus = (status) => {
  returnedStatus = status;
  return {
    json: parentRequestJson,
    send: () => {},
  };
};

var noMatchingRequestByEstablishmentId = false;

describe('test fetching approval requests by establishment id', () => {
  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(async () => {
    sinon_sandbox.stub(models.Approvals, 'findbyEstablishmentId').callsFake(async (approvalType) => {
      if (noMatchingRequestByEstablishmentId) {
        return null;
      } else {
        return fakeApproval;
      }
    });

    _initialiseTestWorkplace();
    _initialiseTestUser();
    returnedJson = null;
    returnedStatus = null;
    noMatchingRequestByEstablishmentId = false;
  });

  describe('fetching parent request by establishment id', () => {
    it('should return a pending parent request for a specified establishment', async () => {
      // Arrange (see beforeEach)

      // Act
      await getApprovalRequest(
        {
          params: {
            establishmentId: fakeApproval.EstablishmentID,
          },
          query: {
            type: 'BecomeAParent',
            status: 'Pending',
          },
        },
        { status: parentRequestStatus },
      );

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal({
        requestId: fakeApproval.ID,
        requestUUID: fakeApproval.UUID,
        establishmentId: fakeApproval.EstablishmentID,
        establishmentUid: fakeApproval.Establishment.uid,
        userId: fakeApproval.UserID,
        workplaceId: fakeApproval.Establishment.nmdsId,
        userName: fakeApproval.User.FullNameValue,
        orgName: fakeApproval.Establishment.NameValue,
        requested: moment.utc(fakeApproval.createdAt).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
        data: fakeApproval.Data,
      });
    });

    it('should return null when there is no matching parent request', async () => {
      // Arrange
      noMatchingRequestByEstablishmentId = true;

      // Act
      await getApprovalRequest(
        {
          params: {
            establishmentId: fakeApproval.EstablishmentID,
          },
          query: {
            type: 'BecomeAParent',
            status: 'Pending',
          },
        },
        { status: parentRequestStatus },
      );

      // Assert
      expect(returnedStatus).to.deep.equal(200);
      expect(returnedJson).to.deep.equal(null);
    });
  });
});
