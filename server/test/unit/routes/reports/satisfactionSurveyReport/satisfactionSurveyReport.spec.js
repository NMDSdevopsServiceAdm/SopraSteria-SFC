'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const satisfactionSurveyReport = require('../../../../../routes/reports/satisfactionSurveyReport/report');

describe.only('/server/routes/reports/satisfactionSurveyReport/report', () => {
  describe('satisfactionSurveyReport()', () => {
    const SatisfactionSurveyReportData = [
      {
        user: {
          FullNameValue: 'Test McTest',
          EmailValue: 'test@test.com',
          establishment: {
            nmdsId: 'G100000',
          },
        },
        submittedDate: '2021-04-12',
        didYouDoEverything: 'Yes',
        didYouDoEverythingAdditionalAnswer: '',
        howDidYouFeel: 'Satisfied',
      },
      {
        user: {
          FullNameValue: 'Bill McTest',
          EmailValue: 'test2@test.com',
          establishment: {
            nmdsId: 'G100001',
          },
        },
        submittedDate: '2021-04-11',
        didYouDoEverything: 'No',
        didYouDoEverythingAdditionalAnswer: 'Something important',
        howDidYouFeel: 'Neither',
      },
    ];

    afterEach(() => {
      sinon.restore();
    });

    it('should return status 200 and an excel format', async () => {
      sinon.stub(models.satisfactionSurvey, 'generateSatisfactionSurveyReportData').callsFake(async () => {
        return SatisfactionSurveyReportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/satisfactionSurveyReport/report',
      });
      const res = httpMocks.createResponse();

      await satisfactionSurveyReport.generateSatisfactionSurveyReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });
});
