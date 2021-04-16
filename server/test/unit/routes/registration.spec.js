const expect = require('chai').expect;
const faker = require('faker');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const EstablishmentModel = require('../../../models/classes/establishment').Establishment;
const registration = require('../../../routes/registration');

describe.only('server/routes/registration.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('/api/registration', () => {
    it('should register a new user', async () => {
      sinon.stub(EstablishmentModel.prototype, 'save').callsFake(() => {
        this._id = 1;
        this._uid = '1234';
        this._nmdsId = 'J1234567';
      });

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
        establishmentId: 2346,
        establishmentUid: '390f6d3d-2645-4c73-b12c-b8c67bba6140',
        primaryUser: username,
        nmdsId: 'G1003015',
        active: false,
        userstatus: 'PENDING',
      });
    });
  });
});
