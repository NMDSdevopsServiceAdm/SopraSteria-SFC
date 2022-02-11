const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const report = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/report');
const findInactiveWorkplaces = require('../../../../../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const findParentWorkplaces = require('../../../../../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces/report', () => {
  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastLogin: '2020-06-01',
      lastUpdated: '2020-06-01',
      emailTemplate: {
        id: 13,
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Name',
        email: 'test@example.com',
      },
    },
    {
      id: 479,
      name: 'Second Workplace Name',
      nmdsId: 'A0012345',
      lastLogin: '2020-01-01',
      lastUpdated: '2020-01-01',
      emailTemplate: {
        id: 13,
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Name McName',
        email: 'name@mcname.com',
      },
    },
  ];

  afterEach(() => {
    sinon.restore();
  });

  it('should generate a report', async () => {
    sinon.stub(findInactiveWorkplaces, 'findInactiveWorkplaces').returns(dummyInactiveWorkplaces);
    sinon.stub(findParentWorkplaces, 'findParentWorkplaces').returns([]);

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/admin/email-campaigns/inactive-workplaces/report',
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();

    await report.generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
});
