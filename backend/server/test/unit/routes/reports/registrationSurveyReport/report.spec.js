const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const registrationSurveyReport = require('../../../../../routes/reports/registrationSurveyReport/report');
const models = require('../../../../../models')

describe('/server/routes/reports/registrationSurveyReport/report', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dummyRegistrationSurveyResponses = [
    {
      id: 1,
      dateSubmitted:  '2021-04-12',
      whyCreateAccount: ['To help us with the Care Quality Commission'],
      howDidYouHearAboutASCWDS: ['Other'],
      user: {
        id: 1,
        establishment: {
          nmdsId: 'J1234567',
        },
      },
    },
    {
      id: 2,
      dateSubmitted: '2021-04-12',
      whyCreateAccount: ['Other'],
      howDidYouHearAboutASCWDS: ['From an event we attended'],
      user: {
        id: 2,
        establishment: {
          nmdsId: 'A1234567',
        },
      },
    },
  ];

  it('should return status 200 and an excel format', async () => {
    sinon.stub(models.registrationSurvey, 'findAll').callsFake(async () => {
      return dummyRegistrationSurveyResponses;
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/report/registrationSurveyReport/new',
    });
    const res = httpMocks.createResponse();

    await registrationSurveyReport.generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });
});
