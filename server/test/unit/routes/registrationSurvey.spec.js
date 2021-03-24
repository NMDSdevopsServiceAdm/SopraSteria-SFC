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
  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 with all questions answered', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      body: {
        userUUID: '3b22ddf9-0f34-4e1d-af8d-5176c570945c',
        surveyAnswers: {
          participation: {
            answer: 'Yes',
          },
          whyDidYouCreateAccount: {
            answer: ['Other', 'To record and manage staff records'],
          },
          howDidYouHearAboutASCWDS: {
            answer: ['From our local authority'],
          },
        },
      },
    };

    const userModel = {
      id: 1234,
    };

    const expectedRegistrationSurveyParams = {
      userFk: 1234,
      surveyAnswers: {
        participation: {
          answer: 'Yes',
        },
        whyDidYouCreateAccount: {
          answer: ['Other', 'To record and manage staff records'],
        },
        howDidYouHearAboutASCWDS: {
          answer: ['From our local authority'],
        },
      },
    };

    const userStub = sinon.stub(models.user, 'findByUUID').returns(userModel);
    const registrationSurveyStub = sinon.stub(models.registrationSurvey, 'create');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(200);
    userStub.should.have.been.calledWith(request.body.userUUID);
    registrationSurveyStub.should.have.been.calledWith(expectedRegistrationSurveyParams);
  });

  it('should return 200 when questions are skipped', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      body: {
        userUUID: '3b22ddf9-0f34-4e1d-af8d-5176c570945c',
        surveyAnswers: {
          participation: {
            answer: 'Yes',
          },
          whyDidYouCreateAccount: {
            answer: [],
          },
          howDidYouHearAboutASCWDS: {
            answer: [],
          },
        },
      },
    };

    const userModel = {
      id: 1234,
    };

    const expectedRegistrationSurveyParams = {
      userFk: 1234,
      surveyAnswers: {
        participation: {
          answer: 'Yes',
        },
        whyDidYouCreateAccount: {
          answer: [],
        },
        howDidYouHearAboutASCWDS: {
          answer: [],
        },
      },
    };

    const userStub = sinon.stub(models.user, 'findByUUID').returns(userModel);
    const registrationSurveyStub = sinon.stub(models.registrationSurvey, 'create');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(200);
    userStub.should.have.been.calledWith(request.body.userUUID);
    registrationSurveyStub.should.have.been.calledWith(expectedRegistrationSurveyParams);
  });

  it('should return an HTTP 500 if the user is not found', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      body: {
        userUUID: '3b22ddf9-0f34-4e1d-af8d-5176c570945c',
        surveyAnswers: {
          participation: {
            answer: 'Yes',
          },
          whyDidYouCreateAccount: {
            answer: [],
          },
          howDidYouHearAboutASCWDS: {
            answer: [],
          },
        },
      },
    };

    sinon.stub(models.user, 'findByUUID').returns(null);

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });

  it('should return an error if surveyAnswers does not exist', async () => {
    const request = {
      method: 'POST',
      url: '/api/registrationSurvey',
      body: {
        userUUID: '3b22ddf9-0f34-4e1d-af8d-5176c570945c',
      },
    };

    const userModel = {
      id: 1234,
    };

    sinon.stub(models.user, 'findByUUID').returns(userModel);
    sinon.stub(models.registrationSurvey, 'create').throws();

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await registrationSurvey.submitSurvey(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
