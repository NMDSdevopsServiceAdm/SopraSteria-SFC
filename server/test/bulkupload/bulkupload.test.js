const supertest = require('supertest');
const baseEndpoint = require('../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const uuid = require('uuid');
const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

const randomString = require('../utils/random').randomString;

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../mockdata/postcodes').data;
const registrationUtils = require('../utils/registration');
const admin = require('../utils/admin').admin;

// change history validation
const validatePropertyChangeHistory = require('../utils/changeHistory').validatePropertyChangeHistory;
let MIN_TIME_TOLERANCE = process.env.TEST_DEV ? 1000 : 400;
let MAX_TIME_TOLERANCE = process.env.TEST_DEV ? 3000 : 1000;
const PropertiesResponses = {};

describe('Bulk upload', () => {
  let nonCqcServices = null;
  let nonCQCSite = null;
  let loginAuth = null;
  let establishmentId = null;
  let establishmentUid = null;
  beforeAll(async () => {
    const nonCqcServicesResults = await apiEndpoint
      .get('/services/byCategory?cqc=false')
      .expect('Content-Type', /json/)
      .expect(200);
    nonCqcServices = nonCqcServicesResults.body;
    nonCQCSite = registrationUtils.newNonCqcSite(postcodes[2], nonCqcServices);
    const registration = await apiEndpoint
      .post('/registration')
      .send([nonCQCSite])
      .expect('Content-Type', /json/)
      .expect(200);
    if (registration) {
      const adminLogin = await apiEndpoint
        .post('/login')
        .send(admin)
        .expect('Content-Type', /json/)
        .expect(200);
      if (adminLogin.headers.authorization) {
        const approval = await apiEndpoint
          .post('/admin/approval')
          .set({ Authorization: adminLogin.headers.authorization })
          .send({
            username: nonCQCSite.user.username,
            approve: true,
          })
          .expect('Content-Type', /json/)
          .expect(200);
        if (approval) {
          const login = await apiEndpoint
            .post('/login')
            .send({
              username: nonCQCSite.user.username,
              password: nonCQCSite.user.password,
            })
            .expect('Content-Type', /json/)
            .expect(200);
          loginAuth = login.headers.authorization;
          establishmentId = login.body.establishment.id;
          establishmentUid = login.body.establishment.uid;
        }
      }
    }
  });
  beforeEach(async () => {});

  describe('/establishment/:establishmentuid/localIdentifiers', () => {
    it('should return an  if all workers and establishments have a local identifier', async () => {
      const localidentifiers = await apiEndpoint.get(`/establishment/${encodeURIComponent(establishmentUid)}/localIdentifiers`)
        .set('Authorization', loginAuth)
        .expect(200);
        const workplace = localidentifiers.body.establishments[0];
        expect(Array.isArray(localidentifiers.body.establishments)).toEqual(true);
        expect(localidentifiers.body.establishments.length).toEqual(1);
        expect(workplace.uid).toEqual(establishmentUid);
        expect(workplace.name).toEqual(nonCQCSite.locationName);
        expect(workplace.missing).toEqual(true);
        expect(workplace.workers).toEqual(0);
    });
  });
});
