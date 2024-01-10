const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const { getRegistrations } = require('../../../../../routes/admin/registrations/getRegistrations');

describe('getRegistrations', async () => {
  const getDummyEstablishment = (details) => {
    const { name, postcode, parentId, parentUid, status, establishmentUid, created, updated } = details;
    const dummyEstablishment = {
      NameValue: name,
      created,
      updated,
      get() {},
    };

    sinon
      .stub(dummyEstablishment, 'get')
      .withArgs('PostCode')
      .returns(postcode)
      .withArgs('ParentID')
      .returns(parentId)
      .withArgs('ParentUID')
      .returns(parentUid)
      .withArgs('Status')
      .returns(status)
      .withArgs('EstablishmentUID')
      .returns(establishmentUid);

    return dummyEstablishment;
  };

  const expectedResponseArray = [
    {
      name: 'Establishment1',
      postcode: 'AB1 2CD',
      parentId: 12345,
      parentUid: 'parent1Uid',
      status: 'PENDING',
      workplaceUid: 'establishment1Uid',
      created: '01/01/2021',
      updated: '01/02/2021',
      parentEstablishmentId: 'A1321121',
    },
    {
      name: 'Establishment2',
      postcode: 'AB4 5CD',
      parentId: 123,
      parentUid: 'parent2Uid',
      status: 'IN PROGRESS',
      workplaceUid: 'establishment2Uid',
      created: '02/01/2021',
      updated: '02/02/2021',
      parentEstablishmentId: 'A1321121',
    },
  ];

  let req;
  let res;

  const setup = () => {
    const dummyEstablishment1 = getDummyEstablishment({
      name: 'Establishment1',
      postcode: 'AB1 2CD',
      parentId: 12345,
      parentUid: 'parent1Uid',
      status: 'PENDING',
      establishmentUid: 'establishment1Uid',
      created: '01/01/2021',
      updated: '01/02/2021',
      IsRegulated: true,
    });

    const dummyEstablishment2 = getDummyEstablishment({
      name: 'Establishment2',
      postcode: 'AB4 5CD',
      parentId: 123,
      parentUid: 'parent2Uid',
      status: 'IN PROGRESS',
      establishmentUid: 'establishment2Uid',
      created: '02/01/2021',
      updated: '02/02/2021',
      IsRegulated: false,
    });

    sinon
      .stub(models.establishment, 'getEstablishmentRegistrationsByStatus')
      .returns([dummyEstablishment1, dummyEstablishment2]);

    sinon.stub(models.establishment, 'getNmdsIdUsingEstablishmentId').returns({
      get() {
        return 'A1321121';
      },
    });

    const request = {
      method: 'GET',
      url: 'api/admin/registrations/pending',
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  };

  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a 200 status code', async () => {
    await getRegistrations(req, res);
    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return an array of registrations', async () => {
    await getRegistrations(req, res);
    const returnedRegistrations = res._getData();

    expect(returnedRegistrations.length).to.equal(2);

    returnedRegistrations.map((registration, index) => {
      expect(registration.name).to.equal(expectedResponseArray[index].name);
      expect(registration.postcode).to.equal(expectedResponseArray[index].postcode);
      expect(registration.status).to.equal(expectedResponseArray[index].status);
      expect(registration.workplaceUid).to.equal(expectedResponseArray[index].workplaceUid);
      expect(registration.parentId).to.equal(expectedResponseArray[index].parentId);
      expect(registration.parentUid).to.equal(expectedResponseArray[index].parentUid);
      expect(registration.created).to.equal(expectedResponseArray[index].created);
      expect(registration.updated).to.equal(expectedResponseArray[index].updated);
      expect(registration.parentEstablishmentId).to.equal(expectedResponseArray[index].parentEstablishmentId);
      expect(registration.IsRegulated).to.equal(expectedResponseArray[index].IsRegulated);
    });
  });

  it('should return a 500 status code when an error is thrown', async () => {
    sinon.restore();

    sinon.stub(models.establishment, 'getEstablishmentRegistrationsByStatus').throws();

    await getRegistrations(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
