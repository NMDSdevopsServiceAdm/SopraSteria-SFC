const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

const findInactiveWorkplaces = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const { createCampaign, getHistory, getInactiveWorkplaces } = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  it('should get the number of inactive workplaces', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/email-campaigns/inactive-workplaces`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();
    await getInactiveWorkplaces(req, res);
    const response = res._getJSONData();

    expect(response.inactiveWorkplaces).to.deep.equal(2);
  });

  it('should create a campaign', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: `/api/admin/email-campaigns/inactive-workplaces`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();
    await createCampaign(req, res);
    const response = res._getJSONData();

    expect(response).to.deep.equal({
      date: '2021-02-05',
      emails: 5673,
    });
  });

  it('should get the email campaign history', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/email-campaigns/inactive-workplaces/history`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();
    await getHistory(req, res);
    const response = res._getJSONData();

    expect(response).to.deep.equal([
      {
        date: '2021-01-05',
        emails: 1356,
      },
      {
        date: '2020-12-05',
        emails: 278,
      },
    ]);
  });

  it('should return inactive workplaces', async () => {
    const inactiveWorkplaces = await findInactiveWorkplaces();

    expect(inactiveWorkplaces).to.deep.equal([
      {
        name: 'Workplace Name',
        nmdsId: 'J1234567',
        lastUpdated: '2020-06-01',
        emailTemplate: 6,
        dataOwner: 'Workplace',
        user: {
          name: 'Test Name',
          email: 'test@example.com',
        },
      },
      {
        name: 'Second Workplace Name',
        nmdsId: 'A0012345',
        lastUpdated: '2020-01-01',
        emailTemplate: 12,
        dataOwner: 'Workplace',
        user: {
          name: 'Name McName',
          email: 'name@mcname.com',
        },
      }
    ]);
  });
});
