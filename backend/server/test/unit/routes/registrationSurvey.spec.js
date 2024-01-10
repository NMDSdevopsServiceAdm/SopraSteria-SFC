const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../models');

const registrationSurvey = require('../../../routes/registrationSurvey');

describe('registrationSurvey', async () => {
  let userFindStub;

  beforeEach(() => {
    userFindStub = sinon.stub(models.user, 'findByUUID').returns({ id: 1234 });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 with all questions answered', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      user: {
        id: '85b2a783-ff2d-4c83-adba-c25378afa19c',
      },
      body: {
        whyDidYouCreateAccount: {
          answer: ['Other', 'To record and manage staff records'],
        },
        howDidYouHearAboutASCWDS: {
          answer: ['From our local authority'],
        },
      },
    };

    const expectedRegistrationSurveyParams = {
      userFk: 1234,
      whyDidYouCreateAccount: {
        answer: ['Other', 'To record and manage staff records'],
      },
      howDidYouHearAboutASCWDS: {
        answer: ['From our local authority'],
      },
    };

    const registrationSurveyStub = sinon.stub(models.registrationSurvey, 'create');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(200);
    registrationSurveyStub.should.have.been.calledWith(expectedRegistrationSurveyParams);
    userFindStub.should.have.been.calledWith(request.user.id);
  });

  it('should return 200 when questions are skipped', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      user: {
        id: 1234,
      },
      body: {
        whyDidYouCreateAccount: {
          answer: [],
        },
        howDidYouHearAboutASCWDS: {
          answer: [],
        },
      },
    };

    const expectedRegistrationSurveyParams = {
      userFk: 1234,
      whyDidYouCreateAccount: {
        answer: [],
      },
      howDidYouHearAboutASCWDS: {
        answer: [],
      },
    };

    const registrationSurveyStub = sinon.stub(models.registrationSurvey, 'create');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(200);
    registrationSurveyStub.should.have.been.calledWith(expectedRegistrationSurveyParams);
  });

  it('should return a 500 if create fails', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      user: {
        id: 1234,
      },
      body: {},
    };

    sinon.stub(models.registrationSurvey, 'create').throws();

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
