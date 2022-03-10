const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const postcodeOrLocationIDRoute = require('../../../../../routes/locations/postcodeOrLocationID');
const locationIDRoute = require('../../../../../routes/locations/locationID');
const postcodeRoute = require('../../../../../routes/locations/postcode');

const pCodeCheck = require('../../../../../utils/postcodeSanitizer');

describe('locations route', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getLocationsByPostcodeOrLocationID()', () => {
    it('should call location endpoint if searching by locationID', async () => {
      const postcodeOrLocationID = '1-2111759818';

      const getLocationsByPostcode = sinon.stub(postcodeRoute, 'getLocationsByPostcode').returns();
      const getLocations = sinon.stub(locationIDRoute, 'getLocations').returns();
      const sanitisePostcodeSpy = sinon.spy(pCodeCheck, 'sanitisePostcode');

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/locations/pcorlid/${postcodeOrLocationID}`,
        params: {
          postcodeOrLocationID,
        },
      });

      const res = httpMocks.createResponse();

      await postcodeOrLocationIDRoute.getLocationsByPostcodeOrLocationID(req, res, true);

      sinon.assert.notCalled(getLocationsByPostcode);
      sinon.assert.calledWith(sanitisePostcodeSpy, postcodeOrLocationID);
      sinon.assert.calledOnce(getLocations);
    });
    it('should call postcode endpoint if searching by postcode', async () => {
      const postcodeOrLocationID = 'LS1 1AA';

      const getLocationsByPostcode = sinon.stub(postcodeRoute, 'getLocationsByPostcode').returns();
      const getLocations = sinon.stub(locationIDRoute, 'getLocations').returns();
      const sanitisePostcodeSpy = sinon.spy(pCodeCheck, 'sanitisePostcode');

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/locations/pcorlid/${postcodeOrLocationID}`,
        params: {
          postcodeOrLocationID,
        },
      });

      const res = httpMocks.createResponse();

      await postcodeOrLocationIDRoute.getLocationsByPostcodeOrLocationID(req, res, true);

      sinon.assert.notCalled(getLocations);
      sinon.assert.calledWith(sanitisePostcodeSpy, postcodeOrLocationID);
      sinon.assert.calledOnce(getLocationsByPostcode);
    });
  });
});
