const supertest = require('supertest');
const baseEndpoint = require('../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../mockdata/postcodes').data;
const registrationUtils = require('../../utils/registration');
const admin = require('../../utils/admin').admin;

var adminLogin = null;

describe('Training Categories API', () => {
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

  describe.only('/api/trainingCategories/{establishmentId}/with-training', () => {
    it('should return a 404 if establishment is not found', async () => {
      // Arrange
      const establishmentId = 123;

      if (adminLogin.headers.authorization) {
        const response = await apiEndpoint

        // Act
        .get(`/trainingCategories/${establishmentId}/with-training`)
        .set({ Authorization: adminLogin.headers.authorization })

        // Assert
        .expect(404);

        expect(response.body).to.deep.equal({
          message: 'Establishment was not found.',
        });
      }
    });
  })
});
