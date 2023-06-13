'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const deleteReport = require('../../../../../routes/reports/deleteReport/report');
const models = require('../../../../../models');

const { rawDataBuilder } = require('../../../../factories/deleteReport/deleteReport');

describe('/server/routes/reports/deleteReport/report', () => {
  describe('deleteReport()', () => {
    beforeEach(() => {
      sinon.stub(models.pcodedata, 'getCssrFromPostcode').callsFake(async () => {
        return {};
      });
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should return status 200 and an excel format', async () => {
      sinon.stub(models.establishment, 'generateDeleteReportData').callsFake(async () => {
        return [rawDataBuilder(), rawDataBuilder(), rawDataBuilder()];
      });
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/deleteReport/report',
      });
      const res = httpMocks.createResponse();

      await deleteReport.generateDeleteReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });
});
