const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const { updateStatus } = require('../../../../../routes/admin/parent-approval/updateStatus');

describe('updateStatus', () => {
  let req;
  let res;

  const dummyDetails = {
    Status: 'Pending',
    UUID: 'bbd54f18-f0bd-4fc2-893d-e492faa9b278',
    ID: 1,
    InReview: false,
    Reviewer: null,
    User: { FullNameValue: 'Joe Bloggs', RegistrationID: 1 },
    Establishment: {
      id: 1,
      uid: 'f61696f7-30fe-441c-9c59-e25dfcb51f59',
      nmdsId: 'J111111',
      NameValue: 'Workplace 1',
      address1: 'Care Home 1',
      address2: '31 King Street',
      address3: 'Sale',
      town: 'Manchester',
      county: 'Cheshire',
      postcode: 'CA1 2BD',
    },
    save() {
      return true;
    },
  };

  beforeEach(() => {
    const request = {
      method: 'POST',
      url: '/api/admin/cqc-status-change/updateRegistrationStatus',
      body: {
        status: 'In progress',
        uid: 'someuid',
        reviewer: 'admin',
        inReview: true,
      },
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();

    sinon.stub(models.Approvals, 'findbyEstablishmentId').returns(dummyDetails);
    sinon.stub(models.establishment, 'findByUid').returns({ id: 123 });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 when the pending flag gets updated', async () => {
    await updateStatus(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return 200 when the approval is In progress but being reviewed by the person making the request', async () => {
    const newDummyDetails = { ...dummyDetails, Status: 'In progress', Reviewer: 'admin', InReview: true };

    sinon.restore();
    sinon.stub(models.Approvals, 'findbyEstablishmentId').returns(newDummyDetails);
    sinon.stub(models.establishment, 'findByUid').returns({ id: 123 });

    await updateStatus(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return 400 when the establishment cannot be found', async () => {
    sinon.restore();
    sinon.stub(models.establishment, 'findByUid').returns(null);

    await updateStatus(req, res);
    const expectedResponse = { error: 'Workplace could not be found' };

    expect(res.statusCode).to.deep.equal(400);
    expect(res._getData()).to.deep.equal(expectedResponse);
  });

  it('should return 400 when the approval cannot be found', async () => {
    sinon.restore();
    sinon.stub(models.establishment, 'findByUid').returns({ id: 123 });
    sinon.stub(models.Approvals, 'findbyEstablishmentId').returns(null);

    await updateStatus(req, res);
    const expectedResponse = { error: 'Parent request could not be found' };

    expect(res.statusCode).to.deep.equal(400);
    expect(res._getData()).to.deep.equal(expectedResponse);
  });

  it('should return 400 if the approval is already being reviewed by someone else', async () => {
    sinon.restore();
    sinon.stub(models.establishment, 'findByUid').returns({ id: 123 });
    sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
      InReview: true,
      Reviewer: 'someoneElse',
      status: 'In progress',
    });

    await updateStatus(req, res);
    const expectedResponse = { error: 'This parent request is already being reviewed' };

    expect(res.statusCode).to.deep.equal(400);
    expect(res._getData()).to.deep.equal(expectedResponse);
  });

  it('should return 500 when an error is thrown getting the establishment', async () => {
    sinon.restore();
    sinon.stub(models.establishment, 'findByUid').throws();

    await updateStatus(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });

  it('should return 500 when an error is thrown getting the approval', async () => {
    sinon.restore();
    sinon.stub(models.establishment, 'findByUid').returns({ id: 123 });
    sinon.stub(models.Approvals, 'findbyEstablishmentId').throws();

    await updateStatus(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
