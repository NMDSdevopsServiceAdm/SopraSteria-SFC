const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../../models/index');
const establishmentSearch = require('../../../../../../routes/admin/search/establishments');
const { establishmentBuilder } = require('../../../../../factories/models');

describe('server/routes/admin/search/establishments', () => {
  let emptySearchObj;

  beforeEach(() => {
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
        updated: '2019-10-07T08:49:30.625Z',
        employerType: {},
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
            },
          },
        ],
        notes: [
          {
            note: 'This is a note',
            noteType: 'Registration',
            createdAt: '2019-10-07T08:49:30.625Z',
          },
        ],
      },
    ]);

    sinon.stub(establishmentSearch, 'iLike').returns('iLike');

    emptySearchObj = {
      name: null,
      postcode: null,
      nmdsId: null,
      locationId: null,
      provId: null,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should search establishments by postcode', async () => {
    const establishment = establishmentBuilder();

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/admin/search/establishments',
      body: {
        postcode: 'WF14 9TS',
      },
    });

    req.role = 'Admin';
    req.establishment = {
      id: establishment.id,
    };

    const res = httpMocks.createResponse();

    await establishmentSearch.search(req, res);

    const response = res._getJSONData();

    expect(response).to.deep.equal([
      {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        name: '123444',
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
        employerType: {},
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
        notes: [
          {
            note: 'This is a note',
            noteType: 'Registration',
            createdAt: '2019-10-07T08:49:30.625Z',
          },
        ],
        lastUpdated: '2019-10-07T08:49:30.625Z',
      },
    ]);
  });

  describe('createSearchObject', () => {
    it('should create a searchObject with an empty object if nothing is in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({});
      expect(searchObject).to.deep.equal({});
    });

    it('should create a searchObject with NameValue field if workplace name is in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({ ...emptySearchObj, name: 'Care Home 1' });

      expect(searchObject).to.deep.equal({
        NameValue: {
          ['iLike']: 'Care Home 1',
        },
      });
    });

    it('should create a searchObject with postcode field if postcode is in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({ ...emptySearchObj, postcode: 'SR3 4AB' });

      expect(searchObject).to.deep.equal({
        postcode: {
          ['iLike']: 'SR3 4AB',
        },
      });
    });

    it('should create a searchObject with nmdsId field if nmdsId is in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({ ...emptySearchObj, nmdsId: 'BB111111' });

      expect(searchObject).to.deep.equal({
        nmdsId: {
          ['iLike']: 'BB111111',
        },
      });
    });

    it('should create a searchObject with locationId field if locationId is in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({ ...emptySearchObj, locationId: '1-1111111111' });

      expect(searchObject).to.deep.equal({
        locationId: {
          ['iLike']: '1-1111111111',
        },
      });
    });

    it('should create a searchObject with providerId field if providerId is in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({ ...emptySearchObj, provId: '6678912345' });

      expect(searchObject).to.deep.equal({
        provId: {
          ['iLike']: '6678912345',
        },
      });
    });

    it('should create a searchObject with all fields if all fields are in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({
        name: 'Care Home 1',
        postcode: 'SR3 4AB',
        nmdsId: 'BB111111',
        locationId: '1-1111111111',
        provId: '6678912345',
      });

      expect(searchObject).to.deep.equal({
        NameValue: {
          ['iLike']: 'Care Home 1',
        },
        postcode: {
          ['iLike']: 'SR3 4AB',
        },
        nmdsId: {
          ['iLike']: 'BB111111',
        },
        locationId: {
          ['iLike']: '1-1111111111',
        },
        provId: {
          ['iLike']: '6678912345',
        },
      });
    });

    it('should create a searchObject with postcode and name fields if postcode and name fields are in the body', () => {
      const searchObject = establishmentSearch.createSearchObject({
        ...emptySearchObj,
        name: 'Care Home 1',
        postcode: 'SR3 4AB',
      });

      expect(searchObject).to.deep.equal({
        NameValue: {
          ['iLike']: 'Care Home 1',
        },
        postcode: {
          ['iLike']: 'SR3 4AB',
        },
      });
    });

    it('should create a searchObject with all fields if all fields are in the body formatted correctly', () => {
      const searchObject = establishmentSearch.createSearchObject({
        name: '%Care Home 1',
        postcode: '*SR3 4AB*',
        nmdsId: 'BB111111?',
        locationId: '*1-1111111111',
        provId: '_6678912345',
      });

      expect(searchObject).to.deep.equal({
        NameValue: {
          ['iLike']: 'Care Home 1',
        },
        postcode: {
          ['iLike']: '%SR3 4AB%',
        },
        nmdsId: {
          ['iLike']: 'BB111111_',
        },
        locationId: {
          ['iLike']: '%1-1111111111',
        },
        provId: {
          ['iLike']: '6678912345',
        },
      });
    });
  });

  describe('formattingSearchParameter', () => {
    it('should remove any % or  _ sign', () => {
      const formattedParameter = establishmentSearch.formattingSearchParameters('%_a');
      expect(formattedParameter).to.deep.equal('a');
    });

    it('should replace any * with a %', () => {
      const formattedParameter = establishmentSearch.formattingSearchParameters('*string*');
      expect(formattedParameter).to.deep.equal('%string%');
    });

    it('should replace any ? with a _', () => {
      const formattedParameter = establishmentSearch.formattingSearchParameters('?string?');
      expect(formattedParameter).to.deep.equal('_string_');
    });
  });
});
