'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const satisfactionSurveyReport = require('../../../../../routes/reports/satisfactionSurveyReport/report');

describe('/server/routes/reports/satisfactionSurveyReport/report', () => {
  describe('satisfactionSurveyReport()', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return status 200 and an excel format', async () => {
      const fullSatisfactionSurveyReportData = [
        {
          user: {
            FullNameValue: 'Test McTest',
            EmailValue: 'test@test.com',
          },
          establishment: {
            nmdsId: 'G100000',
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
          },
          establishment: {
            nmdsId: 'G100001',
          },
          submittedDate: '2021-04-11',
          didYouDoEverything: 'No',
          didYouDoEverythingAdditionalAnswer: 'Something important',
          howDidYouFeel: 'Neither',
        },
      ];

      sinon.stub(models.satisfactionSurvey, 'generateSatisfactionSurveyReportData').callsFake(async () => {
        return fullSatisfactionSurveyReportData;
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

    it('should return status 200 and an excel format if there is no user data', async () => {
      const noUserSatisfactionSurveyReportData = [
        {
          submittedDate: '2021-04-12',
          didYouDoEverything: 'Yes',
          didYouDoEverythingAdditionalAnswer: '',
          howDidYouFeel: 'Satisfied',
        },
        {
          submittedDate: '2021-04-11',
          didYouDoEverything: 'No',
          didYouDoEverythingAdditionalAnswer: 'Something important',
          howDidYouFeel: 'Neither',
        },
      ];

      sinon.stub(models.satisfactionSurvey, 'generateSatisfactionSurveyReportData').callsFake(async () => {
        return noUserSatisfactionSurveyReportData;
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

    it('should return status 200 and an excel format if there is empty user data', async () => {
      const emptyUserSatisfactionSurveyReportData = [
        {
          user: {},
          establishment: {
            nmdsId: 'G100000',
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
          },
          establishment: {
            nmdsId: 'G100001',
          },
          submittedDate: '2021-04-11',
          didYouDoEverything: 'No',
          didYouDoEverythingAdditionalAnswer: 'Something important',
          howDidYouFeel: 'Neither',
        },
      ];

      sinon.stub(models.satisfactionSurvey, 'generateSatisfactionSurveyReportData').callsFake(async () => {
        return emptyUserSatisfactionSurveyReportData;
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

    it('should return status 200 and an excel format if there is no establishment data', async () => {
      const emptyEstablishmentSatisfactionSurveyReportData = [
        {
          user: {
            FullNameValue: 'Test McTest',
            EmailValue: 'test@test.com',
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
          },
          establishment: {
            nmdsId: 'G100001',
          },
          submittedDate: '2021-04-11',
          didYouDoEverything: 'No',
          didYouDoEverythingAdditionalAnswer: 'Something important',
          howDidYouFeel: 'Neither',
        },
      ];

      sinon.stub(models.satisfactionSurvey, 'generateSatisfactionSurveyReportData').callsFake(async () => {
        return emptyEstablishmentSatisfactionSurveyReportData;
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

    it('should return status 200 and an excel format if there is empty establishment data', async () => {
      const emptyEstablishmentSatisfactionSurveyReportData = [
        {
          user: {
            FullNameValue: 'Test McTest',
            EmailValue: 'test@test.com',
          },
          establishment: {},
          submittedDate: '2021-04-12',
          didYouDoEverything: 'Yes',
          didYouDoEverythingAdditionalAnswer: '',
          howDidYouFeel: 'Satisfied',
        },
        {
          user: {
            FullNameValue: 'Bill McTest',
            EmailValue: 'test2@test.com',
          },
          establishment: {
            nmdsId: 'G100001',
          },
          submittedDate: '2021-04-11',
          didYouDoEverything: 'No',
          didYouDoEverythingAdditionalAnswer: 'Something important',
          howDidYouFeel: 'Neither',
        },
      ];

      sinon.stub(models.satisfactionSurvey, 'generateSatisfactionSurveyReportData').callsFake(async () => {
        return emptyEstablishmentSatisfactionSurveyReportData;
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
