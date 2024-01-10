const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const registrations = require('../../../../../routes/admin/registrations/getSingleRegistration');

describe('getSingleRegistration', async () => {
  const getDummyEstablishmentDetails = (withLoginDetails) => {
    const dummyEstablishmentDetails = {
      NameValue: 'Test Workplace',
      created: '20100101',
      updatedBy: 'bob',
      mainService: {
        name: 'Caring',
        id: '1213',
      },
      get() {},
    };

    sinon
      .stub(dummyEstablishmentDetails, 'get')
      .withArgs('EstablishmentID')
      .returns('1234')
      .withArgs('IsRegulated')
      .returns(false)
      .withArgs('NmdsID')
      .returns('A1234567')
      .withArgs('Address1')
      .returns('Somewhere Street')
      .withArgs('Address2')
      .returns('The Village')
      .withArgs('Address3')
      .returns('Third Line')
      .withArgs('PostCode')
      .returns('L125AB')
      .withArgs('Town')
      .returns('Leeds')
      .withArgs('County')
      .returns('Yorkshire')
      .withArgs('LocationID')
      .returns('1234')
      .withArgs('ProvID')
      .returns('A1311')
      .withArgs('ParentID')
      .returns('6155')
      .withArgs('ParentUID')
      .returns('a13131313bac')
      .withArgs('Status')
      .returns('PENDING')
      .withArgs('EstablishmentUID')
      .returns('a131313dasd123325453bac')
      .withArgs('EmployerTypeValue')
      .returns('Other')
      .withArgs('EmployerTypeOtherValue')
      .returns('other employer type');

    if (withLoginDetails) {
      addLoginDetailsToDummyData(dummyEstablishmentDetails);
    }

    return dummyEstablishmentDetails;
  };

  const dummyParentDetails = {
    get() {
      return 'A1311221';
    },
  };

  const addLoginDetailsToDummyData = (dummyEstablishmentDetails) => {
    const login = {
      get() {},
    };
    sinon.stub(login, 'get').withArgs('username').returns('bobtestuser');

    const dummyLoginDetails = {
      created: '20100101',
      login,
      get() {},
    };

    sinon
      .stub(dummyLoginDetails, 'get')
      .withArgs('FullNameValue')
      .returns('Bob Bobby')
      .withArgs('SecurityQuestionValue')
      .returns('What is your favourite colour?')
      .withArgs('SecurityQuestionAnswerValue')
      .returns('Blue')
      .withArgs('EmailValue')
      .returns('bob@testemail.com')
      .withArgs('PhoneValue')
      .returns('01022193277');

    dummyEstablishmentDetails.users = [dummyLoginDetails];
  };

  const expectedResponse = {
    created: '1/1/2010 12:00am',
    username: 'bob',
    establishment: {
      id: '1234',
      name: 'Test Workplace',
      isRegulated: false,
      nmdsId: 'A1234567',
      address: 'Somewhere Street',
      address2: 'The Village',
      address3: 'Third Line',
      postcode: 'L125AB',
      town: 'Leeds',
      county: 'Yorkshire',
      locationId: '1234',
      provid: 'A1311',
      mainService: 'Caring',
      parentId: '6155',
      parentUid: 'a13131313bac',
      parentEstablishmentId: 'A1311221',
      status: 'PENDING',
      uid: 'a131313dasd123325453bac',
    },
  };

  const expectedLoginResponse = {
    name: 'Bob Bobby',
    username: 'bobtestuser',
    securityQuestion: 'What is your favourite colour?',
    securityQuestionAnswer: 'Blue',
    email: 'bob@testemail.com',
    phone: '01022193277',
    created: '1/1/2010 12:00am',
  };

  let dummyEstablishmentDetails, getEstablishmentWithPrimaryUserStub, req, res;

  const setup = (withLoginDetails = false) => {
    dummyEstablishmentDetails = getDummyEstablishmentDetails(withLoginDetails);

    getEstablishmentWithPrimaryUserStub = sinon.stub(models.establishment, 'getEstablishmentWithPrimaryUser');
    getEstablishmentWithPrimaryUserStub.returns(dummyEstablishmentDetails);

    sinon.stub(models.establishment, 'getNmdsIdUsingEstablishmentId').returns(dummyParentDetails);

    const request = {
      method: 'GET',
      url: '/api/admin/registrations/status/a131313dasd123325453bac',
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  };

  afterEach(() => {
    sinon.restore();
  });

  describe('Without login details (parent adding workplace)', async () => {
    beforeEach(() => {
      setup(false);
    });

    it('should return 200 when valid uid', async () => {
      await registrations.getSingleRegistration(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return created date and username', async () => {
      await registrations.getSingleRegistration(req, res);

      const returnedResponse = res._getData();

      expect(returnedResponse.created).to.equal(expectedResponse.created);
      expect(returnedResponse.username).to.equal(expectedResponse.username);
    });

    it('should return establishment info', async () => {
      await registrations.getSingleRegistration(req, res);

      const returnedResponse = res._getData();

      expect(returnedResponse.establishment.id).to.equal(expectedResponse.establishment.id);
      expect(returnedResponse.establishment.name).to.equal(expectedResponse.establishment.name);
      expect(returnedResponse.establishment.isRegulated).to.equal(expectedResponse.establishment.isRegulated);
      expect(returnedResponse.establishment.nmdsId).to.equal(expectedResponse.establishment.nmdsId);
      expect(returnedResponse.establishment.address).to.equal(expectedResponse.establishment.address);
      expect(returnedResponse.establishment.address2).to.equal(expectedResponse.establishment.address2);
      expect(returnedResponse.establishment.address3).to.equal(expectedResponse.establishment.address3);
      expect(returnedResponse.establishment.postcode).to.equal(expectedResponse.establishment.postcode);
      expect(returnedResponse.establishment.town).to.equal(expectedResponse.establishment.town);
      expect(returnedResponse.establishment.county).to.equal(expectedResponse.establishment.county);
      expect(returnedResponse.establishment.locationId).to.equal(expectedResponse.establishment.locationId);
      expect(returnedResponse.establishment.provid).to.equal(expectedResponse.establishment.provid);
      expect(returnedResponse.establishment.mainService).to.equal(expectedResponse.establishment.mainService);
      expect(returnedResponse.establishment.parentId).to.equal(expectedResponse.establishment.parentId);
      expect(returnedResponse.establishment.parentUid).to.equal(expectedResponse.establishment.parentUid);
      expect(returnedResponse.establishment.parentEstablishmentId).to.equal(
        expectedResponse.establishment.parentEstablishmentId,
      );
      expect(returnedResponse.establishment.status).to.equal(expectedResponse.establishment.status);
      expect(returnedResponse.establishment.uid).to.equal(expectedResponse.establishment.uid);
    });

    it('should not return user info when no login details linked to account (workplace added by parent)', async () => {
      await registrations.getSingleRegistration(req, res);

      const returnedResponse = res._getData();

      expect(returnedResponse.name).to.equal(undefined);
      expect(returnedResponse.securityQuestion).to.equal(undefined);
      expect(returnedResponse.securityQuestionAnswer).to.equal(undefined);
      expect(returnedResponse.email).to.equal(undefined);
      expect(returnedResponse.phone).to.equal(undefined);
    });

    it('should return a 500 on error', async () => {
      models.establishment.getNmdsIdUsingEstablishmentId.restore();
      sinon.stub(models.establishment, 'getNmdsIdUsingEstablishmentId').throws();

      await registrations.getSingleRegistration(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('With login details (new account registration)', async () => {
    beforeEach(() => {
      setup(true);
    });

    it('should return user info when login details linked to account (new account registration)', async () => {
      await registrations.getSingleRegistration(req, res);

      const returnedResponse = res._getData();

      expect(returnedResponse.name).to.equal(expectedLoginResponse.name);
      expect(returnedResponse.securityQuestion).to.equal(expectedLoginResponse.securityQuestion);
      expect(returnedResponse.securityQuestionAnswer).to.equal(expectedLoginResponse.securityQuestionAnswer);
      expect(returnedResponse.email).to.equal(expectedLoginResponse.email);
      expect(returnedResponse.phone).to.equal(expectedLoginResponse.phone);
      expect(returnedResponse.created).to.equal(expectedLoginResponse.created);
    });
  });
});
