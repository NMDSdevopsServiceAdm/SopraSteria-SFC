const supertest = require('supertest');
const baseEndpoint = require('../../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;
const models = require('../../../../../models');
// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../../mockdata/postcodes').data;
const registrationUtils = require('../../../utils/registration');
const admin = require('../../../utils/admin').admin;
const parentApproval = require('../../../../../routes/admin/parent-approval');

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
    approvalRequest = await models.Approvals.create({
      EstablishmentID: login.user.establishment.id,
      UserID: login.user.id,
      Status: 'Pending',
      ApprovalType: 'BecomeAParent'
    });
  });

  beforeEach(async() => {});

  describe('/admin/parent-approval',
    () => {
      it('should return an array when fetching become-a-parent requests',
        async () => {
          // Arrange
          const approve = true;
          if (adminLogin.headers.authorization) {
            const result = await apiEndpoint

              // Act
              .get('/admin/parent-approval')
              .set({ Authorization: adminLogin.headers.authorization })

              // Assert
              .expect('Content-Type', /json/)
              .expect(200);
            expect(result.body).to.not.equal(undefined);
            expect(Array.isArray(result.body));
          }
        });

      it('should return a confirmation message and status 200 when an org is granted parent status',
        async () => {
          // Arrange
          if (adminLogin.headers.authorization) {
            const result = await apiEndpoint

              // Act
              .post('/admin/parent-approval')
              .set({ Authorization: adminLogin.headers.authorization })
              .send({
                approve: false,
                parentRequestId: approvalRequest.ID,
                establishmentId: login.user.establishment.id
              })

              // Assert
              .expect('Content-Type', /json/)
              .expect(200);
            expect(result.body.message).to.equal(parentApproval.parentRejectionConfirmation);
          }
        });

      it('should return status 400 when passed bad data',
        async () => {
          // Arrange
          if (adminLogin.headers.authorization) {
            const result = await apiEndpoint

            // Act
            .post('/admin/parent-approval')
            .set({ Authorization: adminLogin.headers.authorization })
            .send({
              approve: true,
              parentRequestId: 99999999,
              establishmentId: 9999
            })

            // Assert
            .expect(400);
          }
        });
    });
});
