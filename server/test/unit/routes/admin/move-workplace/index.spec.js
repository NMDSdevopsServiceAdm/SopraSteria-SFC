const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const sinon_sandbox = sinon.createSandbox();

const models = require('../../../../../models/index');
const { moveWorkplaceAdmin } = require('../../../../../routes/admin/move-workplace');

const { establishmentBuilder } = require('../../../../factories/models');

const { cloneDeep } = require('lodash');

describe('server/routes/admin/moveWorkplaceAdmin.js', () => {
  const parentEstablishment = establishmentBuilder();
  parentEstablishment.isParent = true;

  const nonParentEstablishment = establishmentBuilder();
  nonParentEstablishment.isParent = false;

  const subEstablishment = establishmentBuilder();
  subEstablishment.save = () => {};

  let parentStub, subStub;

  const request = {
    method: 'POST',
    url: '/api/admin/move-workplace',
    body: {
      parentUid: parentEstablishment.uid,
      subUid: subEstablishment.uid,
    },
  };

  beforeEach(async () => {
    const stub = sinon_sandbox.stub(models.establishment, 'findByUid');

    parentStub = stub.onFirstCall().callsFake(async (id) => {
      if (id === parentEstablishment.uid) {
        return parentEstablishment;
      } else if (id === nonParentEstablishment.uid) {
        return nonParentEstablishment;
      } else {
        return null;
      }
    });

    subStub = stub.onSecondCall().callsFake(async (id) => {
      if (id === subEstablishment.uid) {
        return subEstablishment;
      } else {
        return null;
      }
    });
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  it('should return status 200 when sub is updated and saved', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    const saveStub = sinon_sandbox.stub(subEstablishment, 'save');

    await moveWorkplaceAdmin(req, res);

    expect(subEstablishment.parentUid).to.equal(parentEstablishment.uid);
    expect(subEstablishment.parentId).to.equal(parentEstablishment.id);
    expect(saveStub.calledOnce).be.true;

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return a 500 when the save fails', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    const saveStub = sinon_sandbox.stub(subEstablishment, 'save').throws();

    await moveWorkplaceAdmin(req, res);

    expect(saveStub.calledOnce).be.true;
    expect(res.statusCode).to.deep.equal(500);
  });

  it('Finds the correct parent and child workplace', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);

    sinon_sandbox.assert.calledWith(parentStub, request.body.parentUid);
    sinon_sandbox.assert.calledWith(subStub, request.body.subUid);
  });

  it('returns a 404 if parent does not exist', async () => {
    const request404 = cloneDeep(request);
    request404.body.parentUid = '4698f4a4-ab82-4906-8b0e-3f4972375927';

    const req = httpMocks.createRequest(request404);
    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);

    expect(res.statusCode).to.deep.equal(404);
  });

  it('returns a 404 if sub does not exist', async () => {
    const request404 = cloneDeep(request);
    request404.body.subUid = '1298f4a4-ab82-4906-8b0e-3f4972375927';

    const req = httpMocks.createRequest(request404);
    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);

    expect(res.statusCode).to.deep.equal(404);
  });

  it('returns a 406 if parent is not a parent', async () => {
    const nonParentRequest = {
      method: 'POST',
      url: '/api/admin/move-workplace',
      body: {
        parentUid: nonParentEstablishment.uid,
        subUid: subEstablishment.uid,
      },
    };

    const req = httpMocks.createRequest(nonParentRequest);
    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);

    expect(res.statusCode).to.deep.equal(406);
  });
});
