const expect = require('chai').expect;
const sinon = require('sinon');
const GovNotifyClient = require('notifications-node-client').NotifyClient;

const config = require('../../../../config/config');
const { sendPasswordReset, sendAddUser, sendUpdateUserDetails } = require('../../../../utils/email/notify-email');

describe('gov notify send email', () => {
  const defaultConfig = config.getProperties();

  const mockConfig = {
    'notify.replyTo': 'mock-reply-to-id',
    'notify.key': 'mock-api-key',
    env: 'localhost',
    'notify.templates.resetPassword': 'template-id-for-resetPassword',
    'notify.templates.addUser': 'template-id-for-addUser',
    'notify.templates.updateUserDetails': 'template-id-for-update-user-details',
  };

  const stubConfig = (overrides) => {
    sinon.stub(config, 'get').callsFake((key) => {
      const config = { ...mockConfig, ...overrides };
      return config[key] ?? '';
    });
  };

  afterEach(() => {
    sinon.restore();
  });

  const mockEmailAddress = 'test@example.com';
  const mockName = 'Jane Smith';
  const mockUuid = 'mock-uid';

  describe('sendPasswordReset', () => {
    it('should call sendEmail with the expected parameters', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig();

      await sendPasswordReset(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).to.have.been.called;

      expect(sendEmailSpy).to.have.been.calledWith('template-id-for-resetPassword', mockEmailAddress, {
        personalisation: {
          name: mockName,
          resetUuid: mockUuid,
        },
        reference: sinon.match(/localhost-password-reset-.*/),
        emailReplyToId: 'mock-reply-to-id',
      });
    });

    it('should not call sendEmail if API key is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.key': defaultConfig.notify.key });

      await sendPasswordReset(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).not.to.have.been.called;
    });

    it('should not call sendEmail if ReplyToId is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.replyTo': defaultConfig.notify.replyTo });

      await sendPasswordReset(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).not.to.have.been.called;
    });

    it('should not call sendEmail if template id is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.templates.resetPassword': defaultConfig.notify.templates.resetPassword });

      await sendPasswordReset(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).not.to.have.been.called;
    });
  });

  describe('sendAddUser', () => {
    it('should call sendEmail with the expected parameters', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig();

      await sendAddUser(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).to.have.been.called;

      expect(sendEmailSpy).to.have.been.calledWith('template-id-for-addUser', mockEmailAddress, {
        personalisation: {
          name: mockName,
          addUserUuid: mockUuid,
        },
        reference: sinon.match(/localhost-add-user-.*/),
        emailReplyToId: 'mock-reply-to-id',
      });
    });

    it('should not call sendEmail if API key is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.key': defaultConfig.notify.key });

      await sendAddUser(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).not.to.have.been.called;
    });

    it('should not call sendEmail if ReplyToId is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.replyTo': defaultConfig.notify.replyTo });

      await sendAddUser(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).not.to.have.been.called;
    });

    it('should not call sendEmail if template id is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.templates.addUser': defaultConfig.notify.templates.addUser });

      await sendAddUser(mockEmailAddress, mockName, mockUuid);
      expect(sendEmailSpy).not.to.have.been.called;
    });
  });

  describe('sendUpdateUserDetails', () => {
    const mockToday = new Date('2026-07-03T12:34:56.000Z');
    let clock;

    before(() => {
      clock = sinon.useFakeTimers(mockToday);
    });

    after(() => {
      clock.restore();
    });

    it('should call sendEmail with the expected parameters', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig();

      await sendUpdateUserDetails(mockEmailAddress, mockName);
      expect(sendEmailSpy).to.have.been.called;

      expect(sendEmailSpy).to.have.been.calledWith('template-id-for-update-user-details', mockEmailAddress, {
        personalisation: {
          name: mockName,
          date: '3 July 2026',
        },
        reference: sinon.match(/localhost-update-user-details-.*/),
        emailReplyToId: 'mock-reply-to-id',
      });
    });

    it('should not call sendEmail if API key is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.key': defaultConfig.notify.key });

      await sendUpdateUserDetails(mockEmailAddress, mockName);
      expect(sendEmailSpy).not.to.have.been.called;
    });

    it('should not call sendEmail if ReplyToId is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.replyTo': defaultConfig.notify.replyTo });

      await sendUpdateUserDetails(mockEmailAddress, mockName);
      expect(sendEmailSpy).not.to.have.been.called;
    });

    it('should not call sendEmail if template id is not available', async () => {
      const sendEmailSpy = sinon.stub(GovNotifyClient.prototype, 'sendEmail');
      stubConfig({ 'notify.templates.updateUserDetails': defaultConfig.notify.templates.updateUserDetails });

      await sendUpdateUserDetails(mockEmailAddress, mockName);
      expect(sendEmailSpy).not.to.have.been.called;
    });
  });
});
