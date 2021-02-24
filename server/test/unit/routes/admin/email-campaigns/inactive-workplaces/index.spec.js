const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const models = require('../../../../../../models');
const findInactiveWorkplaces = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const sendEmail = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces/sendEmail');
const inactiveWorkplaceRoutes = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

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
      url: '/api/admin/email-campaigns/inactive-workplaces',
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
      const userMock = sinon.stub(models.user, 'findByUUID').returns({
        id: 1,
      });
      const createEmailCampaignMock = sinon.stub(models.EmailCampaign, 'create').returns({
        id: 1,
        userID: 1,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
      });
      const createEmailCampaignHistoryMock = sinon.stub(models.EmailCampaignHistory, 'bulkCreate');

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/admin/email-campaigns/inactive-workplaces',
      });

      req.role = 'Admin';
      req.userUid = '1402bf74-bf25-46d3-a080-a633f748b441';

      const res = httpMocks.createResponse();
      await inactiveWorkplaceRoutes.createCampaign(req, res);
      const response = res._getJSONData();

      expect(response).to.deep.equal({
        date: '2021-01-01',
        emails: 2,
      });

      sinon.assert.calledOnce(createEmailCampaignHistoryMock);
      sinon.assert.calledWith(userMock, '1402bf74-bf25-46d3-a080-a633f748b441');
      sinon.assert.calledWith(createEmailCampaignMock, {
        userID: 1,
      });
      sinon.assert.calledWith(sendEmailMock, dummyInactiveWorkplaces[0]);
      sinon.assert.calledWith(sendEmailMock, dummyInactiveWorkplaces[1]);
    });

    it('should get the email campaign history', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/inactive-workplaces/history',
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
