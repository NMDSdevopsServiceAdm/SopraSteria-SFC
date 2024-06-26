const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models/index');
const {
  getAllWorkersNationalityAndBritishCitizenship,
  getNoOfWorkersWhoRequireInternationalRecruitmentAnswers,
} = require('../../../../routes/establishments/internationalRecruitment');

describe('internationalRecruitmentRoute', async () => {
  const workerWhoDoesNotHaveCitizenshipAndNationalityKnown = () => {
    return {
      uid: 'asd-54',
      NameOrIdValue: 'Test Worker 1',
      NationalityValue: 'Other',
      BritishCitizenshipValue: 'No',
      HealthAndCareVisaValue: null,
      EmployedFromOutsideUkValue: null,
    };
  };

  const workerWhoDoesNotHaveCitizenshipAndNationalityNotKnown = () => {
    return {
      uid: 'asd-89',
      NameOrIdValue: 'Test Worker 2',
      NationalityValue: "Don't know",
      BritishCitizenshipValue: 'No',
      HealthAndCareVisaValue: null,
      EmployedFromOutsideUkValue: null,
    };
  };

  const workerFromOtherNationWithBritishCitizenship = () => {
    return {
      uid: 'asd-835',
      NameOrIdValue: 'Test Worker 3',
      NationalityValue: 'Other',
      BritishCitizenshipValue: 'Yes',
      HealthAndCareVisaValue: null,
      EmployedFromOutsideUkValue: null,
    };
  };

  const britishWorker = () => {
    return {
      uid: 'asd-3466',
      NameOrIdValue: 'Test Worker 4',
      NationalityValue: 'British',
      BritishCitizenshipValue: null,
      HealthAndCareVisaValue: null,
      EmployedFromOutsideUkValue: null,
    };
  };

  const workerWithOtherNationalityAndBritishCitizenshipUnknown = () => {
    return {
      uid: 'asd-5477',
      NameOrIdValue: 'Test Worker 5',
      NationalityValue: 'Other',
      BritishCitizenshipValue: "Don't know",
      HealthAndCareVisaValue: null,
      EmployedFromOutsideUkValue: null,
    };
  };

  const workerWithOtherNationalityAndOtherQuestionsUnanswered = () => {
    return {
      uid: 'asd-2466',
      NameOrIdValue: 'Test Worker 6',
      NationalityValue: 'Other',
      BritishCitizenshipValue: null,
      HealthAndCareVisaValue: null,
      EmployedFromOutsideUkValue: null,
    };
  };

  const workers = () => [
    workerWhoDoesNotHaveCitizenshipAndNationalityKnown(),
    workerWhoDoesNotHaveCitizenshipAndNationalityNotKnown(),
    workerFromOtherNationWithBritishCitizenship(),
    britishWorker(),
    workerWithOtherNationalityAndBritishCitizenshipUnknown(),
    workerWithOtherNationalityAndOtherQuestionsUnanswered(),
  ];

  const filteredWorkers = [
    {
      uid: 'asd-54',
      name: 'Test Worker 1',
      nationality: 'Other',
      britishCitizenship: 'No',
      healthAndCareVisa: null,
      employedFromOutsideUk: null,
    },
    {
      uid: 'asd-89',
      name: 'Test Worker 2',
      nationality: "Don't know",
      britishCitizenship: 'No',
      healthAndCareVisa: null,
      employedFromOutsideUk: null,
    },
    {
      uid: 'asd-5477',
      name: 'Test Worker 5',
      nationality: 'Other',
      britishCitizenship: "Don't know",
      healthAndCareVisa: null,
      employedFromOutsideUk: null,
    },
    {
      uid: 'asd-2466',
      name: 'Test Worker 6',
      nationality: 'Other',
      britishCitizenship: null,
      healthAndCareVisa: null,
      employedFromOutsideUk: null,
    },
  ];

  afterEach(async () => {
    sinon.restore();
  });

  describe('getAllWorkersNationalityAndBritishCitizenship', () => {
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

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').returns(workers());

      await getAllWorkersNationalityAndBritishCitizenship(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the filtered list of workers', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').returns(workers());

      await getAllWorkersNationalityAndBritishCitizenship(req, res);

      expect(res._getData()).to.deep.equal({ workers: filteredWorkers });
    });

    it('should return a 500 status when call is unsuccessful', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').throws();

      await getAllWorkersNationalityAndBritishCitizenship(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('getNoOfWorkersWhoRequireInternationalRecruitmentAnswers', () => {
    const request = {
      method: 'GET',
      url: `/api/establishment/some-uuid/internationalRecruitment/noOfWorkersWhoRequireInternationalRecruitmentAnswers`,
      params: {
        establishmentId: 'some-uuid',
      },
      establishmentId: 'some-uuid',
    };

    it('should return a 200 status when call is successful', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').returns(workers());

      await getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 0 when no workers', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').returns([]);

      await getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(req, res);

      expect(res._getData()).to.deep.equal({ noOfWorkersWhoRequireAnswers: 0 });
    });

    it('should return 0 when workers do not require answers for international recruitment', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon
        .stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship')
        .returns([britishWorker(), workerFromOtherNationWithBritishCitizenship()]);

      await getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(req, res);

      expect(res._getData()).to.deep.equal({ noOfWorkersWhoRequireAnswers: 0 });
    });

    it('should return the number of workers who require answer and have not answered yet (4)', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').returns(workers());

      await getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(req, res);

      expect(res._getData()).to.deep.equal({ noOfWorkersWhoRequireAnswers: 4 });
    });

    it('should return a 500 status when call is unsuccessful', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.worker, 'getAllWorkersNationalityAndBritishCitizenship').throws();

      await getNoOfWorkersWhoRequireInternationalRecruitmentAnswers(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
