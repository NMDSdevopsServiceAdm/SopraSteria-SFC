const supertest = require('supertest');
const baseEndpoint = require('../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;
const models = require('../../../../models');
// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../mockdata/postcodes').data;
const registrationUtils = require('../../utils/registration');
const admin = require('../../utils/admin').admin;

var adminLogin = null;

describe('Approvals', () => {
  let nonCqcServices = null;
  let nonCQCSite = null;
  let login = null;
  let approvalRequest = null;

  before(async () => {
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
      adminLogin = await apiEndpoint.post('/login').send(admin).expect('Content-Type', /json/).expect(200);
    }

    // Create a become-a-parent request.
    login = await models.login.findOne({
      where: { username: admin.username },
      attributes: ['username'],
      include: [
        {
          model: models.user,
          attributes: ['id'],
          include: [
            {
              model: models.establishment,
              attributes: ['id'],
            },
          ],
        },
      ],
    });
    approvalRequest = await models.Approvals.create({
      EstablishmentID: login.user.establishment.id,
      UserID: login.user.id,
      Status: 'Pending',
      ApprovalType: 'BecomeAParent',
    });
  });

  beforeEach(async () => {});

  describe('/approvals/establishment', () => {
    it('should return an object when fetching approval request by establishment id', async () => {
      // Arrange
      const approve = true;
      if (adminLogin.headers.authorization) {
        const result = await apiEndpoint

          // Act
          .get(`/approvals/establishment/${login.user.establishment.id}?type=BecomeAParent&status=Pending`)
          .set({ Authorization: adminLogin.headers.authorization })

          // Assert
          .expect('Content-Type', /json/)
          .expect(200);
        expect(result.body).to.not.equal(undefined);
        expect(result.body.establishmentId).to.equal(login.user.establishment.id);
      }
    });

    it('should return null when no approval request exists for specified establishment id', async () => {
      // Arrange
      const approve = true;
      if (adminLogin.headers.authorization) {
        const result = await apiEndpoint

          // Act
          .get('/approvals/establishment/999999?type=BecomeAParent&status=Pending')
          .set({ Authorization: adminLogin.headers.authorization })

          // Assert
          .expect('Content-Type', /json/)
          .expect(200);
        expect(result.body).to.equal(null);
      }
    });
  });
});
