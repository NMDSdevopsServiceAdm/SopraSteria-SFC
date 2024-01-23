const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const { addRegistrationNote } = require('../../../../../routes/admin/registrations/addRegistrationNote');

describe('addRegistrationNote', () => {
  let req;
  let res;

  beforeEach(() => {
    const request = {
      method: 'POST',
      url: '/api/admin/registrations/addRegistrationNote',
      body: {
        establishmentId: '123',
        note: 'This is a note',
        userUid: '123',
      },
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 when a new note is created', async () => {
    const userId = '123';
    const establishmentId = '123';

    sinon.stub(models.user, 'findByUUID').returns({
      id: userId,
    });

    sinon.stub(models.establishment, 'findByPk').returns({
      id: establishmentId,
    });

    sinon.stub(models.notes, 'createNote').returns(true);

    await addRegistrationNote(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return a 400 error code when given an invalid user uuid', async () => {
    const establishmentId = '123';

    sinon.stub(models.user, 'findByUUID').returns(null);

    sinon.stub(models.establishment, 'findByPk').returns({
      id: establishmentId,
    });

    sinon.stub(models.notes, 'createNote').returns(true);

    await addRegistrationNote(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(400);
    expect(message).to.equal('User not found');
  });

  it('should return a 400 error code when given an invalid establishment id', async () => {
    const userId = '123';

    sinon.stub(models.user, 'findByUUID').returns({
      id: userId,
    });

    sinon.stub(models.establishment, 'findByPk').returns(null);

    sinon.stub(models.notes, 'createNote').returns(true);

    req.body = {
      ...req.body,
      establishmentId: 'invalid id',
    };

    await addRegistrationNote(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(400);
    expect(message).to.equal('Establishment not found');
  });

  it('should return an 500 error if an exception is thrown', async () => {
    const userId = '123';
    const establishmentId = '123';

    sinon.stub(models.user, 'findByUUID').returns({
      id: userId,
    });

    sinon.stub(models.establishment, 'findByPk').returns({
      id: establishmentId,
    });

    sinon.stub(models.notes, 'createNote').throws(function () {
      return new Error();
    });

    await addRegistrationNote(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(500);
    expect(message).to.equal('There was a problem adding the note');
  });
});
