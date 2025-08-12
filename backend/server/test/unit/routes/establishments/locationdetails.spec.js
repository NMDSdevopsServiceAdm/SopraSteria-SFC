const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const cqcLocationUtils = require('../../../../utils/cqcLocationUtils');
const { updateLocationDetails } = require('../../../../routes/establishments/locationdetails');
const { Establishment } = require('../../../../models/classes/establishment');

describe('backend/server/routes/establishments/locationdetails', () => {
  describe('updateLocationDetails', async () => {
    const mockEstablishmentId = 'mockEstablishmentId';
    const mockProviderId = 'mockProviderId';
    let stubEstablishmentLoad;
    let stubGetProviderId;

    const requestPayload = {
      locationId: 'mockLocationId',
      locationName: 'Test Location Name',
      addressLine1: '12 Somewhere Street',
      addressLine2: 'Somewhere',
      townCity: 'Valhalla',
      county: 'Berkshire',
      postalCode: 'S12 5AA',
      mainService: 'Homecare agencies',
    };

    beforeEach(() => {
      sinon.stub(Establishment.prototype, 'restore').resolves(true);
      sinon.stub(Establishment.prototype, 'save').resolves(true);

      stubEstablishmentLoad = sinon.stub(Establishment.prototype, 'load').resolves(true);
      stubGetProviderId = sinon.stub(cqcLocationUtils, 'getProviderId').callsFake((locationId) => {
        return locationId ? mockProviderId : null;
      });
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should update the provider ID if request body contain a location ID', async () => {
      const request = {
        method: 'POST',
        url: `/api/establishment/${mockEstablishmentId}/locationDetails`,
        body: requestPayload,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateLocationDetails(req, res);

      expect(res.statusCode).to.equal(200);

      expect(stubEstablishmentLoad).to.have.been.calledOnceWith({
        locationId: requestPayload.locationId,
        provId: mockProviderId,
        address1: requestPayload.addressLine1,
        address2: requestPayload.addressLine2,
        address3: null,
        town: requestPayload.townCity,
        county: requestPayload.county,
        postcode: requestPayload.postalCode,
        name: requestPayload.locationName,
      });
    });

    it('should leave provider ID unchanged if location ID is not given', async () => {
      const requestPayloadWithoutLocationId = { ...requestPayload };
      delete requestPayloadWithoutLocationId.locationId;

      const request = {
        method: 'POST',
        url: `/api/establishment/${mockEstablishmentId}/locationDetails`,
        body: requestPayloadWithoutLocationId,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateLocationDetails(req, res);

      expect(res.statusCode).to.equal(200);

      expect(stubEstablishmentLoad).to.have.been.calledOnceWith({
        locationId: null,
        address1: requestPayload.addressLine1,
        address2: requestPayload.addressLine2,
        address3: null,
        town: requestPayload.townCity,
        county: requestPayload.county,
        postcode: requestPayload.postalCode,
        name: requestPayload.locationName,
      });
      expect(stubGetProviderId).not.to.be.called;
    });

    it('should not update provider ID if could not find a provider ID with the given location ID', async () => {
      stubGetProviderId.resolves(null);

      const request = {
        method: 'POST',
        url: `/api/establishment/${mockEstablishmentId}/locationDetails`,
        body: requestPayload,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await updateLocationDetails(req, res);

      expect(res.statusCode).to.equal(200);

      expect(stubEstablishmentLoad).to.have.been.calledOnceWith({
        locationId: requestPayload.locationId,
        address1: requestPayload.addressLine1,
        address2: requestPayload.addressLine2,
        address3: null,
        town: requestPayload.townCity,
        county: requestPayload.county,
        postcode: requestPayload.postalCode,
        name: requestPayload.locationName,
      });
    });
  });
});
