const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const {
  registerAccount,
  initialiseEstablishment,
  loadEstablishmentData,
} = require('../../../../routes/registration/registerAccount');
const models = require('../../../../models');
const { Establishment } = require('../../../../models/classes/establishment');

describe('registerAccount', async () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/registration',
      body: {
        establishment: {
          mainService: 'Care',
          isRegulated: false,
        },
        user: {
          password: 'validPassword0',
          username: 'username',
          email: 'testuser@email.com',
        },
      },
    };
    res = httpMocks.createResponse();

    sinon.stub(models.services, 'getMainServiceByName').callsFake(() => {
      return { id: '1', other: true };
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Request validation', () => {
    it('should return 400 and Parameters missing message when req body empty', async () => {
      req.body = {};

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('Parameters missing');
      expect(response.errCode).to.equal(-230);
    });

    it('should return 400 and invalid user message when no user in req body', async () => {
      req.body = { username: 'testuser' };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('User data is invalid');
      expect(response.errCode).to.equal(-800);
    });

    it('should return 400 and invalid user message when user in req body is empty object', async () => {
      req.body = { user: {} };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('User data is invalid');
      expect(response.errCode).to.equal(-800);
    });

    it('should return 400 and invalid password message when password is not valid', async () => {
      req.body = {
        user: {
          password: 'invalid',
        },
      };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal(
        'Password must be at least 8 characters long and have uppercase letters, lowercase letters and numbers',
      );
      expect(response.errCode).to.equal(-220);
    });

    it('should return 400 and invalid username message when username is not valid', async () => {
      req.body = {
        user: {
          password: 'validPassword0',
          username: 'userName0123456!?!?!*&^%',
        },
      };

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.errMessage).to.equal('Invalid Username');
      expect(response.errCode).to.equal(-210);
    });
  });

  describe('Main service errors', async () => {
    it('should return 400 and unexpected main service message when main service cannot be found in database', async () => {
      models.services.getMainServiceByName.restore();
      sinon.stub(models.services, 'getMainServiceByName').callsFake(() => {
        return null;
      });

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Unexpected main service');
      expect(response.status).to.equal(-300);
    });

    it('should return 400 and unexpected main service message mainServiceOther is greater than 120 chars', async () => {
      req.body.establishment.mainServiceOther =
        'This is a really really really really really really really really really really really really really really really really really really really long other service';

      await registerAccount(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(400);
      expect(response.message).to.equal('Unexpected main service');
      expect(response.status).to.equal(-300);
    });
  });
});

describe('Saving establishment to database', () => {
  let newEstablishment;
  let establishmentData;
  beforeEach(() => {
    newEstablishment = new Establishment('username');
    establishmentData = {
      addressLine1: '12 Somewhere Street',
      addressLine2: 'Somewhere',
      addressLine3: 'Somwhere but adressline 3',
      townCity: 'Valhalla',
      county: 'Berkshire',
      locationId: 'locationIdExample',
      postalCode: 'S125AA',
      isRegulated: false,
    };
  });

  describe('initialiseEstablishment', () => {
    it('should set address1 in newEstablishment as addressLine1 passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.address1).to.equal(establishmentData.addressLine1);
    });

    it('should set address2 in newEstablishment as addressLine2 passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.address2).to.equal(establishmentData.addressLine2);
    });

    it('should set address3 in newEstablishment as addressLine3 passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.address3).to.equal(establishmentData.addressLine3);
    });

    it('should set town in newEstablishment as townCity passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.town).to.equal(establishmentData.townCity);
    });

    it('should set county in newEstablishment as county passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.county).to.equal(establishmentData.county);
    });

    it('should set locationId in newEstablishment as townCity passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.locationId).to.equal(establishmentData.locationId);
    });

    it('should set postcode in newEstablishment as postalCode passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.postcode).to.equal(establishmentData.postalCode);
    });

    it('should set isRegulated in newEstablishment as isRegulated passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.isRegulated).to.equal(establishmentData.isRegulated);
    });
  });

  describe('loadEstablishmentData', async () => {
    beforeEach(() => {
      initialiseEstablishment(newEstablishment, establishmentData);

      establishmentData = {
        ...establishmentData,
        locationName: 'Test Location Name',
        mainServiceId: 9,
        mainServiceOther: undefined,
        ustatus: 'PENDING',
        expiresSoonAlertDate: 90,
        numberOfStaff: 4,
      };
    });

    it('should set name in newEstablishment as locationName passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.name).to.equal(establishmentData.locationName);
    });

    it('should set mainService object in newEstablishment with mainServiceId and mainServiceOther passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.mainService.id).to.equal(establishmentData.mainServiceId);
      expect(newEstablishment.mainService.other).to.equal(establishmentData.mainServiceOther);
    });

    it('should set ustatus in newEstablishment as ustatus passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.ustatus).to.equal(establishmentData.ustatus);
    });

    it('should set expiresSoonAlertDate in newEstablishment as expiresSoonAlertDate passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.expiresSoonAlertDate).to.equal(establishmentData.expiresSoonAlertDate);
    });

    it('should set name in numberOfStaff as numberOfStaff passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.numberOfStaff).to.equal(establishmentData.numberOfStaff);
    });
  });
});
