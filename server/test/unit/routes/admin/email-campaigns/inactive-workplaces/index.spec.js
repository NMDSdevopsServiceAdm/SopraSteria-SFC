const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const moment = require('moment');

const models = require('../../../../../../models');
const setInactiveWorkplaces = require('../../../../../../services/email-campaigns/inactive-workplaces/setInactiveWorkplaces');
const setParentWorkplaces = require('../../../../../../services/email-campaigns/inactive-workplaces/setParentWorkplaces');
const setInactiveWorkplacesForDeletion = require('../../../../../../services/email-campaigns/inactive-workplaces/setInactiveWorkplacesForDeletion');
const sendEmail = require('../../../../../../services/email-campaigns/inactive-workplaces/sendEmail');
const inactiveWorkplaceRoutes = require('../../../../../../routes/admin/email-campaigns/inactive-workplaces');

describe('server/routes/admin/email-campaigns/inactive-workplaces', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
  const sixMonthTemplateId = 13;
  const twelveMonthTemplateId = 14;
  const parentTemplateId = 15;

  const dummyInactiveWorkplaces = [
    {
      id: 478,
      name: 'Workplace Name',
      nmdsId: 'J1234567',
      lastLogin: '2020-06-01',
      lastUpdated: '2020-06-01',
      emailTemplate: {
        id: sixMonthTemplateId,
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
        id: twelveMonthTemplateId,
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Name McName',
        email: 'name@mcname.com',
      },
    },
  ];

  const dummyParentWorkplaces = [
    {
      id: 1,
      name: 'Test Name',
      nmdsId: 'A1234567',
      lastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
      lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
      emailTemplate: {
        id: parentTemplateId,
        name: 'Parent',
      },
      dataOwner: 'Workplace',
      user: {
        name: 'Test Person',
        email: 'test@example.com',
      },
      subsidiaries: [
        {
          id: 2,
          name: 'Workplace Name',
          nmdsId: 'A0045232',
          lastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
          lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
          dataOwner: 'Parent',
        },
        {
          id: 3,
          name: 'Workplace Name',
          nmdsId: 'A1245232',
          lastLogin: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
          lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
          dataOwner: 'Parent',
        },
      ],
    },
  ];

  const dummyInactiveWorkplacesForDeletion = [
    {
      name: 'Warren Care CQC 12',
      ascId: 1689,
      address: 'Line 1 My Town My County TN37 6HR',
    },
    {
      name: 'Human Support Group Limited - Sale',
      ascId: 2283,
      address: '59 Cross Street Sale Cheshire M33 7HF',
    },
  ];

  describe('getInactiveWorkplaces', () => {
    it('should get the inactive workplaces', async () => {
      sinon.stub(setInactiveWorkplaces, 'findInactiveWorkplaces').returns(dummyInactiveWorkplaces);
      sinon.stub(setParentWorkplaces, 'findParentWorkplaces').returns(dummyParentWorkplaces);
      sinon
        .stub(setInactiveWorkplacesForDeletion, 'findInactiveWorkplacesForDeletion')
        .returns(dummyInactiveWorkplacesForDeletion);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/inactive-workplaces',
      });

      req.role = 'Admin';

      const res = httpMocks.createResponse();
      await inactiveWorkplaceRoutes.getInactiveWorkplaces(req, res);
      const response = res._getJSONData();

      expect(response.inactiveWorkplaces).to.deep.equal(3);
    });

    it('should return an error if inactive workplaces throws an exception', async () => {
      sinon.stub(setInactiveWorkplaces, 'findInactiveWorkplaces').rejects();
      sinon.stub(setParentWorkplaces, 'findParentWorkplaces').rejects();
      sinon.stub(setInactiveWorkplacesForDeletion, 'findInactiveWorkplacesForDeletion').rejects();

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/inactive-workplaces',
      });

      req.role = 'Admin';

      const res = httpMocks.createResponse();
      await inactiveWorkplaceRoutes.getInactiveWorkplaces(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(500);
      expect(response).to.deep.equal({});
    });
  });

  describe('formattedAddress', () => {
    it('should return the full address in correct format when they exist', () => {
      const data = {
        Address1: '55 KNIGHTS AVENUE',
        Town: 'BEDFORD',
        County: 'LEEDS',
        PostCode: 'MK41 6DG',
      };
      const address = setInactiveWorkplacesForDeletion.formattedAddress(data);

      expect(address).to.equal('55 KNIGHTS AVENUE BEDFORD LEEDS MK41 6DG');
    });

    it('should not return undefinde  when the address have undefined value', () => {
      const data = {
        Address1: '55 KNIGHTS AVENUE',
        Town: undefined,
        County: undefined,
        PostCode: 'MK41 6DG',
      };
      const address = setInactiveWorkplacesForDeletion.formattedAddress(data);
      expect(address).to.equal('55 KNIGHTS AVENUE MK41 6DG');
    });

    it('should not return null when the address have null value', () => {
      const data = {
        Address1: '55 KNIGHTS AVENUE',
        Town: null,
        County: null,
        PostCode: 'MK41 6DG',
      };
      const address = setInactiveWorkplacesForDeletion.formattedAddress(data);
      expect(address).to.equal('55 KNIGHTS AVENUE MK41 6DG');
    });
  });

  describe('createCampaign', async () => {
    it('should create a campaign', async () => {
      sinon.stub(setInactiveWorkplaces, 'findInactiveWorkplaces').returns(dummyInactiveWorkplaces);
      sinon.stub(setParentWorkplaces, 'findParentWorkplaces').returns(dummyParentWorkplaces);

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
        emails: 3,
      });

      sinon.assert.calledOnce(createEmailCampaignHistoryMock);
      sinon.assert.calledWith(userMock, '1402bf74-bf25-46d3-a080-a633f748b441');
      sinon.assert.calledWith(createEmailCampaignMock, {
        userID: 1,
        type: 'inactiveWorkplaces',
      });
      sinon.assert.calledWith(sendEmailMock, dummyInactiveWorkplaces[0]);
      sinon.assert.calledWith(sendEmailMock, dummyInactiveWorkplaces[1]);
      sinon.assert.calledWith(sendEmailMock, dummyParentWorkplaces[0]);
    });

    it('should get the email campaign history', async () => {
      const findAllMock = sinon.stub(models.EmailCampaign, 'findAll').returns([
        {
          toJSON: () => {
            return {
              id: 1,
              createdAt: '2021-01-05 09:00:00',
              emails: 1356,
            };
          },
        },
        {
          toJSON: () => {
            return {
              id: 2,
              createdAt: '2020-12-05 10:00:00',
              emails: 278,
            };
          },
        },
      ]);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/admin/email-campaigns/inactive-workplaces/history',
      });

      req.role = 'Admin';

      const res = httpMocks.createResponse();
      await inactiveWorkplaceRoutes.getHistory(req, res);
      const response = res._getJSONData();

      sinon.assert.called(findAllMock);
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
