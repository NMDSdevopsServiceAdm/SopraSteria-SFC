const supertest = require('supertest');
const baseEndpoint = require('../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../mockdata/postcodes').data;
const registrationUtils = require('../../utils/registration');
const admin = require('../../utils/admin').admin;

describe('Worker', () => {
  let nonCqcServices = null;
  let nonCQCSite = null;
  let loginAuth = null;
  let establishmentId = null;
  let establishmentUid = null;

  before(async() => {
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
                      username: nonCQCSite.user.username.toLowerCase(),
                      approve: true,
                  })
                  .expect('Content-Type', /json/)
                  .expect(200);
              if (approval) {
                  const login = await apiEndpoint
                      .post('/login')
                      .send({
                          username: nonCQCSite.user.username.toLowerCase(),
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

  beforeEach(async() => {});

  describe('/:establishmentUid/worker', () => {
    it('should return an array of all saved worker records', async () => {
      const workers = await apiEndpoint
                  .get(`/${encodeURIComponent(establishmentUid)}/worker`)
                  .set('Authorization', loginAuth)
                  .expect(200);
      console.log(workers);
      expect(Array.isArray(workers)).to.equal(true);
    })
  })
});
