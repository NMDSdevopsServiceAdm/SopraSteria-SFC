'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const satisfactionSurveyReport = require('../../../../../routes/reports/satisfactionSurveyReport/report');

describe.only('/server/routes/reports/satisfactionSurveyReport/report', () => {
  describe('satisfactionSurveyReport()', () => {
    beforeEach(() => {});
    afterEach(() => {
      sinon.restore();
    });

    it('should return status 200 and an excel format', async () => {
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
