const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { addEstablishment } = require('../../../../services/establishment/establishment');
const models = require('../../../../models');
const { Establishment } = require('../../../../models/classes/establishment');
const cqcLocationUtils = require('../../../../utils/cqcLocationUtils');

describe('backend/server/services/establishment/establishment', () => {
  const mockEstablishmentId = 'mockEstablishmentId';
  const mockProviderId = 'mockProviderId';

  const mockEstablishmentData = {
    addressLine1: '12 Somewhere Street',
    addressLine2: 'Somewhere',
    addressLine3: 'Somwhere but adressline 3',
    townCity: 'Valhalla',
    county: 'Berkshire',
    locationId: 'mockLocationId',
    postalCode: 'S125AA',
    isRegulated: true,
    locationName: 'Test Location Name',
    mainService: 'some service',
    totalStaff: 3,
    typeOfEmployer: 'Private Sector',
  };

  beforeEach(() => {
    sinon.stub(models.sequelize, 'transaction').callsFake((dbOperations) => dbOperations());
    sinon.stub(models.services, 'findOne').returns({ name: 'some service', id: 1 });
    sinon.stub(models.establishment, 'findOne').returns({ parentEstablishment: {} });
    sinon.stub(Establishment.prototype, 'save');
    sinon.stub(Establishment.prototype, 'hasMandatoryProperties').value(true);
    sinon.stub(Establishment.prototype, 'isValid').returns(true);

    sinon.stub(cqcLocationUtils, 'getProviderId').callsFake((locationId) => {
      return locationId ? mockProviderId : null;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addEstablishment', () => {
    it('should get the provider ID and set to new establishment if location ID is provided', async () => {
      const request = {
        method: 'POST',
        url: `/api/establishment/${mockEstablishmentId}`,
        body: mockEstablishmentData,
      };
      const newEstablishmentInitialiseStub = sinon.stub(Establishment.prototype, 'initialise');

      const req = httpMocks.createRequest(request);
      req.establishment = { id: 1, uid: mockEstablishmentId };
      const res = httpMocks.createResponse();
      await addEstablishment(req, res);

      expect(res.statusCode).to.equal(201);

      expect(newEstablishmentInitialiseStub).to.have.been.calledOnce;

      const expectedArguments = [
        mockEstablishmentData.addressLine1,
        mockEstablishmentData.addressLine2,
        mockEstablishmentData.addressLine3,
        mockEstablishmentData.townCity,
        mockEstablishmentData.county,
        mockEstablishmentData.locationId,
        mockProviderId,
        mockEstablishmentData.postalCode,
        mockEstablishmentData.isRegulated,
      ];

      expect(newEstablishmentInitialiseStub).to.have.been.calledWith(...expectedArguments);
    });

    it('should set the provider ID as null if location ID is not provided', async () => {
      const mockEstablishmentDataWithoutLocationId = { ...mockEstablishmentData, locationId: null };

      const request = {
        method: 'POST',
        url: `/api/establishment/${mockEstablishmentId}`,
        body: mockEstablishmentDataWithoutLocationId,
      };
      const newEstablishmentInitialiseStub = sinon.stub(Establishment.prototype, 'initialise');

      const req = httpMocks.createRequest(request);
      req.establishment = { id: 1, uid: mockEstablishmentId };
      const res = httpMocks.createResponse();
      await addEstablishment(req, res);

      expect(res.statusCode).to.equal(201);

      expect(newEstablishmentInitialiseStub).to.have.been.calledOnce;

      const expectedArguments = [
        mockEstablishmentData.addressLine1,
        mockEstablishmentData.addressLine2,
        mockEstablishmentData.addressLine3,
        mockEstablishmentData.townCity,
        mockEstablishmentData.county,
        null, // locationId
        null, // providerId
        mockEstablishmentData.postalCode,
        mockEstablishmentData.isRegulated,
      ];

      expect(newEstablishmentInitialiseStub).to.have.been.calledWith(...expectedArguments);
    });
  });
});
