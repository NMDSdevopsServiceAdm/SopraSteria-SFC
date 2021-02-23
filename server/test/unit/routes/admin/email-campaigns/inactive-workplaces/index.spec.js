const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const findInactiveWorkplaces = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const sendEmail = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/sendEmail');
const inactiveWorkplaceRoutes = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dummyInactiveWorkplaces = [
    {
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
      name: 'Second Workplace Name',
      nmdsId: 'A0012345',
      lastUpdated: '2020-01-01',
      emailTemplateId: 12,
      dataOwner: 'Workplace',
      user: {
        name: 'Name McName',
        email: 'name@mcname.com',
      },
    }
  ]

  it('should get the number of inactive workplaces', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/email-campaigns/inactive-workplaces`,
    });

    req.role = 'Admin';

    const res = httpMocks.createResponse();
    await inactiveWorkplaceRoutes.getInactiveWorkplaces(req, res);
    const response = res._getJSONData();

    expect(response.inactiveWorkplaces).to.deep.equal(2);
  });

  it('should return inactive workplaces', async () => {
    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

    expect(inactiveWorkplaces).to.deep.equal(dummyInactiveWorkplaces);
  });

  describe('createCampaign', async () => {
    it('should create a campaign', async () => {
      sinon.stub(findInactiveWorkplaces, 'findInactiveWorkplaces').returns(dummyInactiveWorkplaces);
      const sendEmailMock = sinon.stub(sendEmail, 'sendEmail').returns();

      const req = httpMocks.createRequest({
        method: 'POST',
        url: `/api/admin/email-campaigns/inactive-workplaces`,
      });

      req.role = 'Admin';

      const res = httpMocks.createResponse();
      await inactiveWorkplaceRoutes.createCampaign(req, res);
      const response = res._getJSONData();

      expect(response).to.deep.equal({
        date: '2021-02-05',
        emails: 5673,
      });

      sinon.assert.calledWith(sendEmailMock, dummyInactiveWorkplaces[0]);
      sinon.assert.calledWith(sendEmailMock, dummyInactiveWorkplaces[1]);
    });

    it('should get the email campaign history', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/admin/email-campaigns/inactive-workplaces/history`,
      });

      req.role = 'Admin';

      const res = httpMocks.createResponse();
      await inactiveWorkplaceRoutes.getHistory(req, res);
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
  });
});
