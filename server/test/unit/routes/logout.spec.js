const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../models');
const logout = require('../../../routes/logout').logout;

describe('logout', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should add a logout event to the user audit table for the current user', async () => {
    sinon.stub(models.login, 'findByUsername').returns({registrationId: 123, user: { estblishmentId: 456 }});
    const expected = {
      userFk: 123,
      username: 'username',
      type: 'logout'
    };
    const createLogoutEvent = sinon.mock(models.userAudit);
    createLogoutEvent.expects('create').withExactArgs(expected);
    sinon.stub(models.userAudit, 'countLogouts').returns(2);
    sinon.stub(models.satisfactionSurvey, 'countSubmissions').returns(0);

    await logout('username');

    createLogoutEvent.verify();
  });

  it('should show satisfaction survey when it has not been submitted and there are less than 3 logout events in the last 90 days', async () => {
    sinon.stub(models.login, 'findByUsername').returns({registrationId: 123, user: { estblishmentId: 456 }});
    sinon.stub(models.userAudit, 'create').returns();
    sinon.stub(models.userAudit, 'countLogouts').returns(2);
    sinon.stub(models.satisfactionSurvey, 'countSubmissions').returns(0);

    const result = await logout('username');

    expect(result.showSurvey).to.equal(true);
  });

  it('should not show satisfaction survey when it has been submitted in the last 90 days', async () => {
    sinon.stub(models.login, 'findByUsername').returns({registrationId: 123, user: { estblishmentId: 456 }});
    sinon.stub(models.userAudit, 'create').returns();
    sinon.stub(models.userAudit, 'countLogouts').returns(2);
    sinon.stub(models.satisfactionSurvey, 'countSubmissions').returns(1);

    const result = await logout('username');

    expect(result.showSurvey).to.equal(false);
  });

  it('should not show satisfaction survey when there are more than 3 logout events in the last 90 days', async () => {
    sinon.stub(models.login, 'findByUsername').returns({registrationId: 123, user: { estblishmentId: 456 }});
    sinon.stub(models.userAudit, 'create').returns();
    sinon.stub(models.userAudit, 'countLogouts').returns(4);
    sinon.stub(models.satisfactionSurvey, 'countSubmissions').returns(0);

    const result = await logout('username');

    expect(result.showSurvey).to.equal(false);
  });
})
