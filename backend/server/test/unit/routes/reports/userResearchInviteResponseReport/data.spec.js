const { UserResearchInviteResponsesDataService } = require('../../../../../routes/reports/userResearchInviteResponsesReport/data');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const models = require('../../../../../models');
const { Op } = require('sequelize');
const moment = require('moment');

describe('UserResearchInviteReportData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call findAll requesting user attributes', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponsesDataService.getReportData();

    const attributeArguments = spy.args.map(args => args[0]);
    const userAttributes = attributeArguments[0].attributes;

    expect(spy.calledOnce).to.equal(true);
    expect(userAttributes).to.include('FullNameValue');
    expect(userAttributes).to.include('EmailValue');
    expect(userAttributes).to.include('JobTitleValue');
    expect(userAttributes).to.include('UserResearchInviteResponseValue');
    expect(userAttributes).to.include('created');
    expect(userAttributes).to.include('updated');
  });

  it('should call findAll requesting establishment attributes', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponsesDataService.getReportData();

    const attributeArguments = spy.args.map(args => args[0]);
    const establishmentAttributes = attributeArguments[0].include[0].attributes;

    expect(spy.calledOnce).to.equal(true);
    expect(establishmentAttributes).to.include('nmdsId');
    expect(establishmentAttributes).to.include('NumberOfStaffValue');
  });

  it('should call findAll requesting main service attribute', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponsesDataService.getReportData();

    const attributeArguments = spy.args.map(args => args[0]);
    const servicesAttribute = attributeArguments[0].include[0].include[0].attributes[0];

    expect(spy.calledOnce).to.equal(true);
    expect(servicesAttribute).to.equal('name');
  });

  it('should call findAll requesting only users who have answered the user research question', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponsesDataService.getReportData();

    const whereArgs = spy.getCall(0).args[0];
    const whereConditions = whereArgs.where.UserResearchInviteResponseValue[Op.or];

    expect(spy.calledOnce).to.equal(true);
    expect(whereConditions).to.include('Yes');
    expect(whereConditions).to.include('No');
    expect(whereConditions).not.to.include(null);
  });

  it('should call findAll requesting request only users who are not archived', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponsesDataService.getReportData();

    const callArgs = spy.getCall(0).args[0];
    const whereConditions = callArgs.where.Archived;

    expect(spy.calledOnce).to.equal(true);
    expect(whereConditions).to.equal(false);
  });

  it('should call findAll requesting only users who were created in the last 6 months', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponsesDataService.getReportData();

    const callArgs = spy.getCall(0).args[0];
    const whereConditions = callArgs.where.created[Op.gt].getTime();
    const sixMonthsAgo = moment().subtract(6, 'months').startOf('day').toDate().getTime();

    expect(spy.calledOnce).to.equal(true);
    expect(whereConditions).to.equal(sixMonthsAgo);
  });
});