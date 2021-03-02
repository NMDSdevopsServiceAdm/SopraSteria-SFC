const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const { generateReport } = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/report');
const findInactiveWorkplaces = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/findInactiveWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces/report', () => {
  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: '2020-06-01',
      emailTemplateId: 6,
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
      lastUpdated: '2020-01-01',
      emailTemplateId: 6,
      dataOwner: 'Workplace',
      user: {
        name: 'Name McName',
        email: 'name@mcname.com',
      },
    },
  ];

  it('should generate a report', async () => {
    sinon.stub(findInactiveWorkplaces, 'findInactiveWorkplaces').returns(dummyInactiveWorkplaces);

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/email-campaigns/inactive-workplaces/report`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();

    await generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });
});
