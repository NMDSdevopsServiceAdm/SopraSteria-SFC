const expect = require('chai').expect;
const faker = require('faker');
const models = require('../../../models');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const uuid = require('uuid');

const serviceBuilder = require('../../factories/service');
const registration = require('../../../routes/registration');

describe.only('server/routes/registration.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('/api/registration', () => {
    it('should register a new user', async () => {
      const transaction = (fn) => {
        if (!fn) {
          fn = (t) => {
            return Promise.resolve(t);
          };
        }

        return new Promise((resolve, reject) => {
          return fn({}).then(resolve, reject);
        });
      };

      sinon.stub(models.sequelize, 'transaction').callsFake(transaction);

      const services = [
        serviceBuilder(),
        serviceBuilder(),
      ];
      sinon.stub(models.services, 'findAll').returns(services);

      const service = services[0];
      sinon.stub(models.services, 'findOne').returns({
        id: service.id,
        name: service.name,
      });

      sinon.stub(models.pcodedata, 'findOne').returns({
        uprn: '100021275776',
        sub_building_name: '',
        building_name: '',
        building_number: '41',
        street_description: 'LOWER ROAD',
        post_town: 'HARROW',
        postcode: 'HA2 0DE',
        local_custodian_code: '5450',
        county: 'HARROW',
        rm_organisation_name: '',
        theAuthority: { id: 725, name: 'Harrow', nmdsIdLetter: 'G' },
      });

      sinon.stub(uuid, 'v4').returns('bfa38ab4-462a-489d-877e-afc5d805601a');

      sinon
        .stub(models.sequelize, 'query')
        .withArgs('SELECT nextval(\'cqc."NmdsID_seq"\')', {
          type: models.sequelize.QueryTypes.SELECT,
        })
        .returns([
          {
            nextval: 1234567,
          },
        ])
        .withArgs(sinon.match.any)
        .callThrough();

      const establishment = models.establishment.build({
        id: 2345,
      });
      establishment.setDataValue('EstablishmentID', 2345);

      sinon.stub(models.establishment, 'create').returns(establishment);

      sinon.stub(models.establishment, 'findOne').returns({
        id: 2345,
        uid: 'bfa38ab4-462a-489d-877e-afc5d805601a',
        overallWdfEligibility: null,
        lastWdfEligibility: null,
        establishmentWdfEligibility: null,
        NumberOfStaffValue: null,
        workerCount: '0',
        eligibleWorkersCount: '0',
      });

      const user = models.user.build({
        id: 123,
      });
      user.setDataValue('RegistrationID', 123);
      sinon.stub(models.user, 'create').returns(user);

      sinon.stub(models.login, 'create');
      sinon.stub(models.establishmentAudit, 'bulkCreate');
      sinon.stub(models.userAudit, 'bulkCreate');
      sinon.stub(models.addUserTracking, 'update').returns([]);
      sinon.stub(models.addUserTracking, 'create');

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
        mainService: service.name,
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
        nmdsId: 'G1234567',
        active: false,
        userstatus: 'PENDING',
      });
    });
  });
});
