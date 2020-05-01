const supertest = require('supertest');
const baseEndpoint = require('../../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../../mockdata/postcodes').data;
const registrationUtils = require('../../../utils/registration');
const admin = require('../../../utils/admin').admin;

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
      const adminLogin = await apiEndpoint
        .post('/login')
        .send(admin)
        .expect('Content-Type', /json/)
        .expect(200);
    }
  });

  beforeEach(async() => {});

  describe('/admin/approval', () => {
    //it('should approve a new user that has an associated login, user and workplace', async () => {
    //it('should not approve a new user that doesn't have an associated login', async () => {
    //it('should not approve a new user that doesn't have an associated user', async () => {
    //it('should not approve a new user that doesn't have an associated workplace', async () => {
    //it('should mark the login as active when approving a new user', async () => {
    //it('should remove the pending status from the login when approving a new user', async () => {
    //it('should remove the pending status from the workplace when approving a new user', async () => {
    //it('should NOT mark the login as active when approving a new user with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the login when approving a new user with duplicate workplace Id', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new user with duplicate workplace Id', async () => {
    //it('!!! Write front end tests for the previous 3 scenarios !!!', async () => {
    //it('should return a confirmation message when the user is approved', async () => {
    //it('should delete the login, user and workplace when rejecting a new user', async () => {
    //it('should return a confirmation message when the user is removed because the user is rejected', async () => {
    //it('should return status 400 if there is no login with matching username', async () => {
    //it('should return status 503 if it is not possible to update a user when approving a new user', async () => {
    //it('should return status 503 if it is not possible to update a workplace when approving a new user', async () => {
    //it('should return status 503 if it is not possible to delete a user when rejecting a new user', async () => {
    //it('should return status 503 if it is not possible to delete a workplace when rejecting a new user', async () => {
    //it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new user', async () => {
    //it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new user', async () => {

    //it('should return status 400 and error msg if there is workplace with duplicate workplace id when approving new workplace', async () => {
    //it('should NOT remove the pending status from the workplace when approving a new workplace with duplicate workplace Id', async () => {


    it('should approve a new user that has an associated login, user and establishment', async () => {
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
        }
    })
  })
});
