const supertest = require('supertest');
const baseEndpoint = require('../../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;
const models = require('../../../../../models');
const util = require('util');

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../../mockdata/postcodes').data;
const registrationUtils = require('../../../utils/registration');
const servicesUtils = require('../../../utils/services');
const admin = require('../../../utils/admin').admin;
const cqcStatusChange = require('../../../../../routes/admin/parent-approval');

var adminLogin = null;

describe('Admin/Parent Approval', () => {
  let nonCqcServices = null;
  let nonCQCSite = null;
  let login = null;
  let approvalRequest = null;

  before(async() => {

    // Find a valid service (eg "Carers Support")
    const nonCqcServicesResults = await apiEndpoint
      .get('/services/byCategory?cqc=false')
      .expect('Content-Type', /json/)
      .expect(200);
    nonCqcServices = nonCqcServicesResults.body;

    // Set up the data to register a new user with a new establishment
    nonCQCSite = registrationUtils.newNonCqcSite(postcodes[2], nonCqcServices);

    // Register the new user / establishment
    const registration = await apiEndpoint
      .post('/registration')
      .send([nonCQCSite])
      .expect('Content-Type', /json/)
      .expect(200);

    // Login as an admin user to access parent approvals (would normally be accessed via "Parent requests").
    if (registration) {
      adminLogin = await apiEndpoint
        .post('/login')
        .send(admin)
        .expect('Content-Type', /json/)
        .expect(200);
    }

    // Create a become-a-parent request.
    login = await models.login.findOne({
      where: { username: admin.username },
      attributes: ['username'],
      include: [{
          model: models.user,
          attributes: ['id'],
          include: [{
              model: models.establishment,
              attributes: ['id']
            }]
      }]
    });
    const currentService = servicesUtils.lookupRandomService(nonCqcServices);
    const requestedService = servicesUtils.lookupRandomService(nonCqcServices);
    approvalRequest = await models.Approvals.create({
      EstablishmentID: login.user.establishment.id,
      UserID: login.user.id,
      Status: 'Pending',
      ApprovalType: 'CqcStatusChange',
      Data: {
        requestedService: {
          id: requestedService.id,
          name: requestedService.name,
        },
        currentService: {
          id: currentService.id,
          name: currentService.name,
        },
      },
    });
    console.log("*************************** approvalRequest.Data: " + util.inspect(approvalRequest.Data, false, null, true));
    console.log("*************************** approvalRequest.EstablishmentID: " + util.inspect(approvalRequest.EstablishmentID, false, null, true));
  });

  beforeEach(async() => {});

  describe('/admin/cqc-status-change',
    () => {
      it('should return an array when fetching cqc-status-change requests',
        async () => {
          // Arrange
          const approve = true;
          if (adminLogin.headers.authorization) {
            const result = await apiEndpoint

              // Act
              .get('/admin/cqc-status-change')
              .set({ Authorization: adminLogin.headers.authorization })

              // Assert
              .expect('Content-Type', /json/)
              .expect(200);
            expect(result.body).to.not.equal(undefined);
            expect(Array.isArray(result.body));
            console.log("*************************** result.body: " + util.inspect(result.body, false, null, true));
          }
        });

      it('should return a confirmation message and status 200 when an org is granted a CQC status change request',
        async () => {
          // Arrange
          if (adminLogin.headers.authorization) {
            const result = await apiEndpoint

              // Act
              .post('/admin/cqc-status-change')
              .set({ Authorization: adminLogin.headers.authorization })
              .send({
                approve: false,
                approvalId: approvalRequest.ID
              })

              // Assert
              .expect('Content-Type', /json/)
              .expect(200);
            expect(result.body.message).to.equal(cqcStatusChange.cqcStatusChangeApprovalConfirmation);
          }
        });

      it('should return status 400 when passed bad data',
        async () => {
          // Arrange
          if (adminLogin.headers.authorization) {
            const result = await apiEndpoint

            // Act
            .post('/admin/cqc-status-change')
            .set({ Authorization: adminLogin.headers.authorization })
            .send({
              approve: true,
              approvalId: 99999999
            })

            // Assert
            .expect(400);
          }
        });
    });
});
