const expect = require('chai').expect;
const faker = require('faker');
const models = require('../../../models');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const registration = require('../../../routes/registration');

describe.only('server/routes/registration.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('/api/registration', () => {
    it('should register a new user', async () => {
      const establishment = models.establishment.build({
        id: 2345,
      });
      establishment.setDataValue('EstablishmentID', 2345);

      sinon.stub(models.establishment, 'create').returns(establishment);

      const postcode = {
        uprn: '100021275800',
        address1: 'DUDLEY HOUSE 31 LOWER ROAD ',
        townAndCity: 'HARROW',
        county: 'HARROW',
        postcode: 'HA2 0DE',
        localCustodianCode: '5450',
      };

      const username = faker.internet.userName().replace('.', '_');

      const body = {
        locationName: faker.lorem.words(4),
        addressLine1: postcode.address1,
        addressLine2: faker.lorem.words(2),
        townCity: postcode.townAndCity,
        county: postcode.county,
        postalCode: postcode.postcode,
        mainService: 'Other healthcare service',
        isRegulated: false,
        user: {
          fullname: faker.name.findName(),
          jobTitle: 'Integration Tester',
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber('01#########'),
          username: username,
          password: 'Password00',
          securityQuestion: faker.lorem.words(2),
          securityQuestionAnswer: faker.lorem.words(4),
        },
      };

      const request = {
        method: 'POST',
        url: '/api/registration',
        body: [body],
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      req.sqreen = {};
      req.sqreen.auth_track = () => {};
      req.sqreen.signup_track = () => {};
      req.sqreen.identify = () => {};
      req.sqreen.track = () => {};
      req.sqreen.userIsBanned = () => {};

      await registration.postRegistration(req, res);

      const json = res._getJSONData();
      expect(json).to.deep.equal({
        status: 1,
        message: 'Establishment and primary user successfully created',
        establishmentId: 2345,
        establishmentUid: 'bfa38ab4-462a-489d-877e-afc5d805601a',
        primaryUser: username,
        nmdsId: 'G1003030',
        active: false,
        userstatus: 'PENDING',
      });
    });
  });
});
