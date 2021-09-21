const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const { addRegistrationNote } = require('../../../../../routes/admin/registrations/addRegistrationNote');

describe.only('addRegistrationNote', () => {
  const request = {
    method: 'POST',
    url: '/api/admin/registrations/addRegistrationNote',
    userId: 101,
    establishment: {
      id: 1001,
    },
    body: {
      note: 'This is a not about the registration request',
    },
  };

  const req = httpMocks.createRequest(request);
  const res = httpMocks.createResponse();

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 when a new note is created', async () => {
    sinon.stub(models.registrationNotes, 'createNote').returns(true)
    await addRegistrationNote(req, res);
    expect(res.statusCode).to.deep.equal(200);
  });


});
