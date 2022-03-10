const chai = require('chai');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');

const longTermAbsence = require('../../../routes/longTermAbsence');

describe('longTermAbsence', async () => {
  it('should return 200 with reasons for long term absence', async () => {
    const request = {
      method: 'GET',
      url: '/api/longTermAbsence',
    };

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await longTermAbsence.longTermAbsence(req, res);
    const response = res._getJSONData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response.reasons).to.deep.equal(['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'])
  });
});
