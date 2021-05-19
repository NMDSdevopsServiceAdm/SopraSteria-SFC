const expect = require('chai').expect;
const moment = require('moment');
const sinon = require('sinon');

const config = require('../../../../../config/config');
const sendEmail = require('../../../../../services/email-campaigns/inactive-workplaces/sendEmail');
const sendInBlueEmail = require('../../../../../utils/email/sendInBlueEmail');

describe('server/routes/admin/email-campaigns/inactive-workplaces/sendEmail', () => {
  afterEach(() => {
    sinon.restore();
  });

  const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
  const parentTemplateId = 15;

  describe('sendEmail', () => {
    it('should call sendEmails for inactive workplace', async () => {
      const inactiveWorkplace = {
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
      };

      const sendEmailStub = sinon.stub(sendInBlueEmail, 'sendEmail').returns();

      await sendEmail.sendEmail(inactiveWorkplace);

      sinon.assert.calledWith(
        sendEmailStub,
        {
          email: 'test@example.com',
          name: 'Test Name',
        },
        13,
        {
          WORKPLACE_ID: 'J1234567',
          FULL_NAME: 'Test Name',
        },
      );
    });

    it('should call sendEmails for parent workplaces', async () => {
      const parentWorkplace = {
        id: 1,
        name: 'Test Name',
        nmdsId: 'A1234567',
        lastUpdated: endOfLastMonth.clone().subtract(3, 'months').format('YYYY-MM-DD'),
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
            lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Parent',
          },
        ],
      };

      const sendEmailStub = sinon.stub(sendInBlueEmail, 'sendEmail').returns();

      await sendEmail.sendEmail(parentWorkplace);

      sinon.assert.calledWith(
        sendEmailStub,
        {
          email: 'test@example.com',
          name: 'Test Person',
        },
        15,
        {
          WORKPLACE_ID: 'A1234567',
          FULL_NAME: 'Test Person',
          WORKPLACES: [
            {
              id: 2,
              name: 'Workplace Name',
              nmdsId: 'A0045232',
              lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
              dataOwner: 'Parent',
            },
          ],
        },
      );
    });
  });

  describe('getParams', () => {
    it('returns the right params for single workplaces', () => {
      const inactiveWorkplace = {
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
      };

      const params = sendEmail.getParams(inactiveWorkplace);
      expect(params).to.deep.equal({
        WORKPLACE_ID: 'J1234567',
        FULL_NAME: 'Test Name',
      });
    });

    it('returns the right params for parent workplaces', () => {
      const parentWorkplace = {
        id: 1,
        name: 'Test Name',
        nmdsId: 'A1234567',
        lastUpdated: endOfLastMonth.clone().subtract(3, 'months').format('YYYY-MM-DD'),
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
            lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Parent',
          },
        ],
      };

      const params = sendEmail.getParams(parentWorkplace);
      expect(params).to.deep.equal({
        WORKPLACE_ID: 'A1234567',
        FULL_NAME: 'Test Person',
        WORKPLACES: [
          {
            id: 2,
            name: 'Workplace Name',
            nmdsId: 'A0045232',
            lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Parent',
          },
        ],
      });
    });

    it('includes parent workplace in the WORKPLACES param if the parent is out of date', () => {
      const parentWorkplace = {
        id: 1,
        name: 'Test Name',
        nmdsId: 'A1234567',
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
            lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Parent',
          },
        ],
      };

      const params = sendEmail.getParams(parentWorkplace);
      expect(params).to.deep.equal({
        WORKPLACE_ID: 'A1234567',
        FULL_NAME: 'Test Person',
        WORKPLACES: [
          {
            id: 1,
            name: 'Test Name',
            nmdsId: 'A1234567',
            lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Workplace',
          },
          {
            id: 2,
            name: 'Workplace Name',
            nmdsId: 'A0045232',
            lastUpdated: endOfLastMonth.clone().subtract(12, 'months').format('YYYY-MM-DD'),
            dataOwner: 'Parent',
          },
        ],
      });
    });
  });

  describe('isWhitelisted', () => {
    it('should return true if there is no whitelist', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('');

      const whitelisted = sendEmail.isWhitelisted('test@test.com');

      expect(whitelisted).to.equal(true);
    });

    it('should return true if the email is whitelisted', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

      const whitelisted = sendEmail.isWhitelisted('test@test.com');

      expect(whitelisted).to.equal(true);
    });

    it('should return false if the email is not whitelisted', () => {
      sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

      const whitelisted = sendEmail.isWhitelisted('example@example.com');

      expect(whitelisted).to.equal(false);
    });
  });
});
