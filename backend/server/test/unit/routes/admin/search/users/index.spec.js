const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models/index');
const adminUsersSearchRoute = require('../../../../../../routes/admin/search/users');

const setup = (body) => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/api/admin/search/users',
    body,
  });
  const res = httpMocks.createResponse();
  return { req, res };
};

describe('server/routes/admin/search/users', () => {
  let search;
  beforeEach(() => {
    search = adminUsersSearchRoute.search;

    sinon.stub(models.user, 'searchUsers').resolves([
      {
        uid: 'e8d8ecb1-1d62-475c-850c-451e8588880f',
        FullNameValue: 'Joe Bloggs',
        isPrimary: true,
        SecurityQuestionValue: 'deleniti facilis',
        SecurityQuestionAnswerValue: 'similique exercitationem aut quod',
        EmailValue: 'joe.bloggs@email.com',
        PhoneValue: '01573272630',
        login: {
          username: 'joebloggs',
          isActive: false,
          passwdLastChanged: '2019-10-15T08:28:45.073Z',
          invalidAttempt: 0,
          lastLogin: null,
        },
        establishment: {
          uid: '293b63e9-f98e-4c92-a9a9-25f0da139f3f',
          locationId: null,
          nmdsId: 'J1002532',
          postcode: 'YO23 1JU',
          isRegulated: false,
          address1: '123 STREET',
          isParent: false,
          NameValue: 'pariatur in itaque veniam',
          updated: '2019-10-15T08:28:44.837Z',
          ParentID: null,
          Parent: null,
        },
      },
    ]);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('returns empty array when no search criteria is provided', async () => {
    const { req, res } = setup({
      name: '',
      username: '',
      emailAddress: '',
      phoneNumber: '',
    });

    await search(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).to.equal(200);
    expect(data).to.deep.equal([]);
    expect(models.user.searchUsers.called).to.be.false;
  });

  it('returns empty array when wildcard only is provided', async () => {
    const { req, res } = setup({
      name: '*',
      username: '',
      emailAddress: '',
      phoneNumber: '',
    });

    await search(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).to.equal(200);
    expect(data).to.deep.equal([]);
    expect(models.user.searchUsers.called).to.be.false;
  });

  it('calls searchUsers when valid search criteria is provided', async () => {
    const { req, res } = setup({
      name: 'Joe',
      username: '',
      emailAddress: '',
      phoneNumber: '',
    });

    await search(req, res);

    expect(models.user.searchUsers.calledOnce).to.be.true;
    expect(res.statusCode).to.equal(200);
  });

  it('returns 500 and empty array when search fails', async () => {
    models.user.searchUsers.rejects(new Error('DB error'));

    const { req, res } = setup({
      name: 'Joe',
      username: '',
      emailAddress: '',
      phoneNumber: '',
    });

    await search(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).to.equal(500);
    expect(data).to.deep.equal([]);
  });
});
