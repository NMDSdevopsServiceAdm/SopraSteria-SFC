const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../models');

const { getRegistrationNotes } = require('../../../../../routes/admin/registrations/getRegistrationNotes');

describe('getRegistrationNotes', () => {
  let req;
  let res;

  beforeEach(() => {
    const establishmentUid = 'a131313dasd123325453bac';
    const request = {
      method: 'GET',
      url: `api/admin/registrations/${establishmentUid}/getRegistrationNotes`
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();

    sinon.stub(models.notes, 'getNotesByEstablishmentId').callsFake(async () => {
      return [
        {
          createdAt: new Date('10/08/2021'),
          note: 'Note 1',
          user: { FullNameValue: 'adminUser1' },
        },
        {
          createdAt: new Date('11/09/2021'),
          note: 'Note 2',
          user: { FullNameValue: 'adminUser1' },
        },
      ]
    });
  });

  afterEach(async () => {
    sinon.restore();
  });

  it('should return a 200 status code', async () => {
    sinon.stub(models.establishment, 'findByUid').returns({
      id: '123',
    });

    await getRegistrationNotes(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return an array of notes for the given registration', async () => {
    sinon.stub(models.establishment, 'findByUid').returns({
      id: '123',
    });

    await getRegistrationNotes(req, res)

    const notesArr = res._getData();

    expect(notesArr.length).to.equal(2);
    expect(notesArr).to.deep.equal([
      {
        createdAt: new Date('10/08/2021'),
        note: 'Note 1',
        user: { FullNameValue: 'adminUser1' },
      },
      {
        createdAt: new Date('11/09/2021'),
        note: 'Note 2',
        user: { FullNameValue: 'adminUser1' },
      },
    ])
  });

  it('should return a 400 error code when given an invalid establishment uid', async () => {
    sinon.stub(models.establishment, 'findByUid').returns(null);

    await getRegistrationNotes(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(400);
    expect(message).to.equal('Establishment could not be found');
  });

  it('should return a 500 error code if an exception is thrown', async () => {
    sinon.restore();

    sinon.stub(models.establishment, 'findByUid').returns({
      id: '123',
    });

    sinon.stub(models.notes, 'getNotesByEstablishmentId').throws();

    await getRegistrationNotes(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(500);
    expect(message).to.equal('There was an error retrieving notes for this registration');
  });

});
