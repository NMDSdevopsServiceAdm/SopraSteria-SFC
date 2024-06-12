const expect = require('chai').expect;
const sinon = require('sinon');
const { build, fake, sequence } = require('@jackfranklin/test-data-bot');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models/index');
const {
  getAllWorkersNationalityAndBritishCitizenship,
} = require('../../../../routes/establishments/internationalRecruitment');

describe('internationalRecruitmentRoute', async () => {
  const workers = [
    {
      uid: 'asd-54',
      NameOrIdValue: 'Test Worker 1',
      NationalityValue: null,
      BritishCitizenshipValue: null,
      HealthAndCareVisaValue: null,
    },
    {
      uid: 'asd-89',
      NameOrIdValue: 'Test Worker 2',
      NationalityValue: null,
      BritishCitizenshipValue: null,
      HealthAndCareVisaValue: null,
    },
  ];

  const request = {
    method: 'GET',
    url: `/api/establishment/some-uuid/internationalRecruitment`,
    params: {
      establishmentId: 'some-uuid',
    },
    establishmentId: 'some-uuid',
  };

  it('should return a 200 status when call is successful', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').returns(workers);

    await getAllWorkersNationalityAndBritishCitizenship(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return a 500 status when call is unsuccessful', async () => {
    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();

    sinon.restore();
    sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').throws();

    await getAllWorkersNationalityAndBritishCitizenship(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});
