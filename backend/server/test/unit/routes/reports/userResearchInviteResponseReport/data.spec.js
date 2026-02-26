
const  { UserResearchInviteResponseDataService } = require('../../../../../routes/reports/userResearchInviteResponseReport/data');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const models = require('../../../../../models');
const { Op } = require('sequelize');

describe.only('UserResearchInviteReportData', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should call findAll with attributes', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponseDataService.getAllUsers();

    const attributeArguments = spy.args.map(args => args[0]);
    const attributes = attributeArguments[0].attributes;

    expect(spy.calledOnce).to.equal(true);
    expect(attributes).to.include('EstablishmentID');
    expect(attributes).to.include('FullNameValue');
    expect(attributes).to.include('EmailValue');
    expect(attributes).to.include('JobTitleValue');
    expect(attributes).to.include('UserResearchInviteResponseValue');
    expect(attributes).to.include('created');
    expect(attributes).to.include('updated');
  });

  it('should request only users who have answered the user research question', async () => {
    const spy = sinon.stub(models.user, 'findAll');
    await UserResearchInviteResponseDataService.getAllUsers();

    const callArgs = spy.getCall(0).args[0];
    const whereConditions = callArgs.where.UserResearchInviteResponseValue[Op.or];

    expect(spy.calledOnce).to.equal(true);
    expect(whereConditions).to.include('Yes');
    expect(whereConditions).to.include('No');
    expect(whereConditions).not.to.include(null);
  });
});