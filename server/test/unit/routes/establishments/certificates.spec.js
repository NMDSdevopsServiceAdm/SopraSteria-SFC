const config = require('../../../../config/config');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const { getCertificate, fileExists } = require('../../../../routes/establishments/certificates');
const establishment = require('../../../../models/classes/establishment');


describe('server/routes/establishments/certificates', () => {
    let s3;
    let modelData;
    beforeEach(() => {
        s3 = new (require('aws-sdk').S3)({
            region: String(config.get('certificate.region')),
          });

        modelData = {
            rows: [
              {
                dataOwner: 'Workplace',
                dataOwnershipRequested: null,
                dataPermissions: null,
                mainService: { name: 'Carers support' },
                NameValue: '12345',
                uid: 'ca720581-5319-4ae8-b941-a5a4071ab828',
                updated: '2022-01-31T16:40:27.780Z',
                ustatus: null,
                name: 'John'
              },
            ],
            count: 1,
            pendingCount: 0,
          };
      });

  describe('getCertificate', () => {
    const establishmentId = 'a131313dasd123325453bac';
    let req;
    let request
    let res;
    let url;

    beforeEach(() => {
    url = {
        url: 'Fake Url'
    }
     request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/certificates`,
        params: {
          years: '23-24',
          id: establishmentId,
        },
      };
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it.only('should return 200 status and certificate url as data', async () => {
        // sinon.stub(establishment.Establishment.prototype, 'restore').returns(modelData);
        sinon.stub(s3, 'getObject').returns({url});
        // sinon.stub(fileExists).returns(true);

        await getCertificate(req, res);

        expect(res.statusCode).to.deep.equal(200);
    })
  })
})