const supertest = require('supertest');
const baseEndpoint = require('../../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../../mockdata/postcodes').data;
const registrationUtils = require('../../../utils/registration');
const admin = require('../../../utils/admin').admin;
const approval = require('../../../../../routes/admin/approval');

var adminLogin = null;

describe('Admin/Approval', () => {
  let nonCqcServices = null;
  let nonCQCSite = null;

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

    // Login as an admin user to access approvals (would normally be accessed via "Registrations").
    if (registration) {
      adminLogin = await apiEndpoint
        .post('/login')
        .send(admin)
        .expect('Content-Type', /json/)
        .expect(200);
    }
  });

  beforeEach(async() => {});

  describe('/admin/approval', () => {
    it('should return a confirmation message and status 200 when a new user is approved', async () => {
      // Arrange
      const approve = true;
      if (adminLogin.headers.authorization) {
        const result = await apiEndpoint

          // Act
          .post('/admin/approval')
          .set({ Authorization: adminLogin.headers.authorization })
          .send({
            username: nonCQCSite.user.username.toLowerCase(),
            nmdsId: 'W1234567',
            approve: approve,
          })

          // Assert
          .expect('Content-Type', /json/)
          .expect(200);
        expect(result.body.message).to.equal(approval.userApprovalConfirmation);
      }
    });

    it('should return a confirmation message and status 200 when a new user is removed because the user is rejected', async () => {
      // Arrange
      const approve = false;
      if (adminLogin.headers.authorization) {
        const result = await apiEndpoint

          // Act
          .post('/admin/approval')
          .set({ Authorization: adminLogin.headers.authorization })
          .send({
            username: nonCQCSite.user.username.toLowerCase(),
            nmdsId: 'W1234567',
            approve: approve,
          })

          // Assert
          .expect('Content-Type', /json/)
          .expect(200);
        expect(result.body.message).to.equal(approval.userRejectionConfirmation);
      }
    })
  })
});
