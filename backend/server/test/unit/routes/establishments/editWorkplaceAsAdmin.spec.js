const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const models = require('../../../../models/index');
const { updateEstablishmentFieldAsAdmin } = require('../../../../routes/establishments/editWorkplaceAsAdmin');

describe('updateEstablishmentFieldAsAdmin', () => {
  let establishment;
  let findEstablishmentSpy;
  let updateWithAdminOverridesSpy;

  beforeEach(() => {
    updateWithAdminOverridesSpy = sinon
      .stub()
      .callsFake((sequelizeChanges, _establishmentClassChanges) => sequelizeChanges);
    establishment = {
      updateWithAdminOverrides: updateWithAdminOverridesSpy,
    };

    findEstablishmentSpy = sinon.stub(models.establishment, 'findByPk').resolves(establishment);
  });

  afterEach(() => {
    sinon.restore();
  });

  const mockEstablishmentId = 123;

  const request = {
    method: 'POST',
    url: '/api/establishment/:uid/establishmentField/asAdmin',
    params: {
      id: 'mock-uid',
    },
    body: { numberOfStaff: 9998 },
    establishmentId: mockEstablishmentId,
  };

  it('should respond with 200 and updated establishment field', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await updateEstablishmentFieldAsAdmin(req, res);

    expect(res.statusCode).to.deep.equal(200);

    expect(establishment.updateWithAdminOverrides).to.have.been.calledWith(
      { NumberOfStaffValue: 9998 },
      { numberOfStaff: 9998 },
    );
  });

  it('should respond with 404 if establishment not found', async () => {
    findEstablishmentSpy.restore();
    sinon.stub(models.establishment, 'findByPk').resolves(null);
    sinon.stub(console, 'error');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await updateEstablishmentFieldAsAdmin(req, res);

    expect(res.statusCode).to.deep.equal(404);

    expect(establishment.updateWithAdminOverrides).not.to.have.been.called;
  });

  it('should respond with 500 if error occured', async () => {
    establishment.updateWithAdminOverrides.rejects(new Error('some database error'));
    sinon.stub(console, 'error');

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await updateEstablishmentFieldAsAdmin(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
