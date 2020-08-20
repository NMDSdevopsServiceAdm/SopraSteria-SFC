const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models/index');
const adminUsersSearchRoute = require('../../../../../../routes/admin/search/users');

const setup = () => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: `/api/admin/search`,
    body: {
      username: 'joebloggs',
      name: 'Joe Bloggs'
    },
  });
  const res = httpMocks.createResponse();
  return { req, res};
}

describe('server/routes/admin/search/users', () => {
  let searchUsers;
  beforeEach(() => {
    searchUsers = sinon.spy(models.user, "searchUsers");

    sinon.stub(models.user, 'findAll').returns([
      {
        "uid":"e8d8ecb1-1d62-475c-850c-451e8588880f",
        "FullNameValue":"Joe Bloggs",
        "isPrimary":true,
        "SecurityQuestionValue":"deleniti facilis",
        "SecurityQuestionAnswerValue":"similique exercitationem aut quod",
        "EmailValue":"joe.bloggs@email.com",
        "PhoneValue":"01573272630",
        "login":{
           "username":"joebloggs",
           "isActive":false,
           "passwdLastChanged":"2019-10-15T08:28:45.073Z",
           "invalidAttempt":0,
           "lastLogin":null
        },
        "establishment":{
           "uid":"293b63e9-f98e-4c92-a9a9-25f0da139f3f",
           "locationId":null,
           "nmdsId":"J1002532",
           "postcode":"YO23 1JU",
           "isRegulated":false,
           "address1":"123 STREET",
           "isParent":false,
           "NameValue":"pariatur in itaque veniam",
           "updated":"2019-10-15T08:28:44.837Z",
           "ParentID":null,
           "Parent":null
        }
     },
    ]);
  });
  afterEach(()=> {
    sinon.restore();
  });

  it('should search users by username', async () => {
    const { req, res } = setup();

    await adminUsersSearchRoute.search(req, res);

    expect(searchUsers.called).to.deep.equal(true);
    expect(searchUsers.args[0][0].username).to.deep.equal('joebloggs');
  });

  it('should search users by name', async () => {
    const { req, res } = setup();

    await adminUsersSearchRoute.search(req, res);

    expect(searchUsers.called).to.deep.equal(true);
    expect(searchUsers.args[0][0].name).to.deep.equal('Joe Bloggs');
  });

  it('should map data from database to model for frontend', async () => {
    const { req, res } = setup();

    await adminUsersSearchRoute.search(req, res);

    const response = res._getJSONData();

    expect(response).to.deep.equal([{
      "uid":"e8d8ecb1-1d62-475c-850c-451e8588880f",
      "name":"Joe Bloggs",
      "username":"joebloggs",
      "isPrimary":true,
      "securityQuestion":"deleniti facilis",
      "securityQuestionAnswer":"similique exercitationem aut quod",
      "email":"joe.bloggs@email.com",
      "phone":"01573272630",
      "isLocked":true,
      "invalidAttempt":0,
      "passwdLastChanged":"2019-10-15T08:28:45.073Z",
      "lastLoggedIn":null,
      "establishment":{
          "uid":"293b63e9-f98e-4c92-a9a9-25f0da139f3f",
          "name":"pariatur in itaque veniam",
          "nmdsId":"J1002532",
          "postcode":"YO23 1JU",
          "isRegulated":false,
          "address":"123 STREET",
          "isParent":false,
          "parent":null,
          "locationId":null
      }
    }]);
  })
});
