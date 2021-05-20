const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../models');
const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;
const { downloadGet } = require('../../../../../routes/establishments/bulkUpload/download');
const s3 = require('../../../../../routes/establishments/bulkUpload/s3');
const httpMocks = require('node-mocks-http');
const { apiEstablishmentBuilder } = require('../../../../integration/utils/establishment');
const { knownHeaders } = require('../../../mockdata/establishment');

describe('download', () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    sinon.stub(BUDI, 'establishmentType').callsFake((method, value) => value);
    sinon.stub(BUDI, 'serviceUsers').callsFake((method, value) => value);
    sinon.stub(BUDI, 'jobRoles').callsFake((method, value) => value);
  });

  const establishmentId = 123;

  it('should return establishments file', async () => {
    const establishment = apiEstablishmentBuilder();
    const downloadType = 'establishments';
    const downloadEstablishents = sinon.stub(models.establishment, 'downloadEstablishments').returns([establishment]);
    sinon.stub(s3, 'saveResponse').callsFake((req, res, statusCode, body) => {
      expect(statusCode).to.deep.equal(200);
      expect(body).to.contain(establishment.NameValue);
      expect(body).to.contain(establishment.LocalIdentifierValue);
      expect(body).to.contain(establishment.postcode);
      expect(body).to.contain('UNCHECKED');
      expect(body).to.contain(establishment.address2);
      expect(body).to.contain(establishment.address3);
      expect(body).to.contain(establishment.town);
      expect(body).to.contain(establishment.postcode);
      expect(body).to.contain(establishment.EmployerTypeValue);
      expect(body).to.contain(establishment.EmployerTypeOther);
      expect(body).to.contain(knownHeaders);
    });
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${establishmentId}/bulkupload/download/${downloadType}`,
      params: {
        establishmentId,
        downloadType,
      },
    });
    req.establishment = {
      id: establishmentId,
    };

    req.setTimeout = () => {};

    req.establishmentId = establishmentId;
    const res = httpMocks.createResponse();

    await downloadGet(req, res);
    sinon.assert.calledOnce(downloadEstablishents);
  });
});
