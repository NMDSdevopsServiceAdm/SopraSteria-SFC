const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models/index');
const adminGroupsSearchRoute = require('../../../../../../routes/admin/search/groups');
const { establishmentBuilder } = require('../../../../../factories/models');

describe('server/routes/admin/search/groups', () => {
  let searchEstablishments;
  beforeEach(() => {
    searchEstablishments = sinon.spy(models.establishment, "searchEstablishments");

    sinon.stub(models.establishment, 'findAll').returns([
      {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        NameValue: '123444',
        nmdsId: 'J1002343',
        locationId: '1-23456789',
        address1: '44',
        address2: 'Grace St',
        town: 'Leeds',
        county: 'West Yorkshire',
        postcode: 'WF14 9TS',
        isParent: false,
        isRegulated: false,
        dataOwner: 'Workplace',
        EmployerTypeValue: 'Local Authority (generic/other)',
        EmployerTypeOther: null,
        Parent: {
          id: 1,
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c49f',
          nmdsId: 'W-1234567',
        },
        users: [
          {
            uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
            FullNameValue: 'Test Name',
            SecurityQuestionValue: 'Test Security Question',
            SecurityQuestionAnswerValue: 'Test Security Question Answer',
            login: {
              username: 'thisperson9',
              status: 'Locked',
            }
          }
        ],
        updated: '2019-10-07T08:49:30.625Z',
      },
    ]);
  });
  afterEach(()=> {
    sinon.restore();
  });

  it('should search establishments by employer type', async () => {
    const establishment = establishmentBuilder();

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/search`,
      body: {
        employerType: 'Local Authority (generic/other)'
      },
    });

    req.role = 'Admin';
    req.establishment = {
      id: establishment.id,
    };

    const res = httpMocks.createResponse();

    await adminGroupsSearchRoute.search(req, res);

    const response = res._getJSONData();

    expect(searchEstablishments.called).to.deep.equal(true);
    expect(response).to.deep.equal([{
      uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
      name: '123444',
      nmdsId: 'J1002343',
      locationId: '1-23456789',
      address1: '44',
      address2: 'Grace St',
      town: 'Leeds',
      county: 'West Yorkshire',
      postcode: 'WF14 9TS',
      employerType: {
        value: 'Local Authority (generic/other)',
        other: null
      },
      isParent: false,
      isRegulated: false,
      dataOwner: 'Workplace',
      parent: {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c49f',
        nmdsId: 'W-1234567',
      },
      users: [
        {
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          username: 'thisperson9',
          name: 'Test Name',
          securityQuestion: 'Test Security Question',
          securityAnswer: 'Test Security Question Answer',
          isLocked: true,
        },
      ],
      lastUpdated: '2019-10-07T08:49:30.625Z'
    }]);
  });
  it('should search establishments by employer type and isParent', async () => {
    const establishment = establishmentBuilder();

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/admin/search`,
      body: {
        employerType: 'Local Authority (generic/other)',
        parent: true
      },
    });

    req.role = 'Admin';
    req.establishment = {
      id: establishment.id,
    };

    const res = httpMocks.createResponse();

    await adminGroupsSearchRoute.search(req, res);

    const response = res._getJSONData();

    expect(searchEstablishments.called).to.deep.equal(true);
    expect(searchEstablishments.args[0][0].isParent).to.deep.equal(true);
    expect(response).to.deep.equal([{
      uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
      name: '123444',
      nmdsId: 'J1002343',
      locationId: '1-23456789',
      address1: '44',
      address2: 'Grace St',
      town: 'Leeds',
      county: 'West Yorkshire',
      postcode: 'WF14 9TS',
      employerType: {
        value: 'Local Authority (generic/other)',
        other: null
      },
      isParent: false,
      isRegulated: false,
      dataOwner: 'Workplace',
      parent: {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c49f',
        nmdsId: 'W-1234567',
      },
      users: [
        {
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          username: 'thisperson9',
          name: 'Test Name',
          securityQuestion: 'Test Security Question',
          securityAnswer: 'Test Security Question Answer',
          isLocked: true,
        },
      ],
      lastUpdated: '2019-10-07T08:49:30.625Z'
    }]);
  });
});
