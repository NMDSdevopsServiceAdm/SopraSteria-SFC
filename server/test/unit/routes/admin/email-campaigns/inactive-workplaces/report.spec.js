const excelJS = require('exceljs');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const report = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/report');
const findInactiveWorkplaces = require('../../../../../../models/email-campaigns/inactive-workplaces/findInactiveWorkplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces/report', () => {
  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
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

  it('should generate a report', async () => {
    sinon.stub(findInactiveWorkplaces, 'findInactiveWorkplaces').returns(dummyInactiveWorkplaces);

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/email-campaigns/inactive-workplaces/report`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();

    await report.generateReport(req, res);

    expect(res.statusCode).to.equal(200);
    expect(res._headers['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('should add Workplace to the worksheet', () => {
    const workplace = {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastUpdated: '2020-06-01',
      emailTemplate: {
        id: 13,
        name: '6 months',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Name',
        email: 'test@example.com',
      },
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inactive workplaces');

    const addRow = sinon.spy(worksheet, 'addRow');

    report.printRow(worksheet, workplace);

    sinon.assert.calledWith(addRow, {
      workplace: 'Workplace Name',
      workplaceId: 'J1234567',
      lastUpdated: '2020-06-01',
      emailTemplate: '6 months',
      dataOwner: 'Workplace',
      nameOfUser: 'Test Name',
      userEmail: 'test@example.com',
    });
  });
});
