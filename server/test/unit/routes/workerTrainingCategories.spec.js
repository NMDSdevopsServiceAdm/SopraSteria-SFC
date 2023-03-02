const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');
const { workerBuilder, categoryBuilder, trainingBuilder, mandatoryTrainingBuilder } = require('../../factories/models');
const { getTrainingByCategory, getCategoryTraining } = require('../../../routes/workerTrainingCategories');
const { cloneDeep } = require('lodash');
const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

describe('workerTrainingCategories', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTrainingByCategory', () => {
    it('returns a list of training categories that have training', async () => {
      // Arrange
      const establishmentId = 123;

      const category = categoryBuilder();
      const training = trainingBuilder({
        overrides: {
          categoryFk: category.id,
        },
      });
      const worker = workerBuilder({
        overrides: {
          workerTraining: [training],
        },
      });

      sinon.stub(models.establishment, 'findByPk').callsFake(() => {
        return {
          id: establishmentId,
          workers: [worker],
        };
      });

      sinon.stub(models.workerTrainingCategories, 'findAll').callsFake(() => {
        return [category];
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/trainingCategories/${establishmentId}/with-training`,
      });

      const res = httpMocks.createResponse();

      // Act
      await getTrainingByCategory(req, res);

      // Assert
      const { trainingCategories } = res._getJSONData();

      expect(res.statusCode).equals(200);
      expect(trainingCategories.length).equals(1);

      expect(trainingCategories[0].training.length).equals(1);
      expect(trainingCategories[0].training[0].id).eqls(training.id);
      expect(trainingCategories[0].training[0].uid).equals(training.uid);
      expect(trainingCategories[0].training[0].title).equals(training.title);
      expect(trainingCategories[0].training[0].expires).equals(training.expires);

      expect(trainingCategories[0].training[0].worker).eqls({
        id: worker.id,
        uid: worker.uid,
        NameOrIdValue: worker.NameOrIdValue,
        mainJob: {
          id: worker.mainJob.id,
          title: worker.mainJob.title,
        },
      });
    });

    it('returns a list of training categories with training missing', async () => {
      // Arrange
      const establishmentId = 123;
      const category = categoryBuilder();
      const training = trainingBuilder({
        overrides: {
          categoryFk: category.id,
        },
      });
      const worker = workerBuilder({
        overrides: {
          workerTraining: [training],
        },
      });

      const categoryWithMandatoryTraining = (() => {
        let categoryWithMandatoryTraining = categoryBuilder();
        const mandatoryTraining = mandatoryTrainingBuilder({
          overrides: {
            trainingCategoryFK: categoryWithMandatoryTraining.id,
            jobFK: worker.mainJob.id,
          },
        });

        categoryWithMandatoryTraining.MandatoryTraining = [mandatoryTraining];

        return categoryWithMandatoryTraining;
      })();

      sinon.stub(models.establishment, 'findByPk').callsFake(() => {
        return {
          id: establishmentId,
          workers: [worker],
        };
      });

      sinon.stub(models.workerTrainingCategories, 'findAll').callsFake(() => {
        return [categoryWithMandatoryTraining];
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/trainingCategories/${establishmentId}/with-training`,
      });

      const res = httpMocks.createResponse();

      // Act
      await getTrainingByCategory(req, res);

      // Assert
      const { trainingCategories } = res._getJSONData();

      expect(res.statusCode).equals(200);
      expect(trainingCategories.length).equals(1);

      expect(trainingCategories[0].training.length).equals(1);
      expect(trainingCategories[0].training[0].id).eqls(categoryWithMandatoryTraining.MandatoryTraining[0].id);
      expect(trainingCategories[0].training[0].missing).equals(true);

      expect(trainingCategories[0].training[0].worker).eqls({
        id: worker.id,
        uid: worker.uid,
        NameOrIdValue: worker.NameOrIdValue,
        mainJob: {
          id: worker.mainJob.id,
          title: worker.mainJob.title,
        },
      });
    });

    it('returns a list of empty training categories if an establishment has no staff', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'findWithWorkersAndTraining').returns(null);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/trainingCategories/${establishmentId}/with-training`,
      });

      const res = httpMocks.createResponse();

      // Act
      await getTrainingByCategory(req, res);

      // Assert
      const { trainingCategories } = res._getJSONData();

      expect(trainingCategories).to.deep.equal([]);
    });
  });

  describe('getCategoryTraining', () => {
    const establishmentUid = '167334';
    const trainingCategoryId = '18';
    let req;
    let res;
    let request;

    const category = categoryBuilder();

    const training = trainingBuilder({
      overrides: {
        categoryFK: category.id,
      },
    });
    const trainingMissing = trainingBuilder({
      overrides: {
        categoryFK: null,
        completed: null,
        expires: null,
        id: null,
        title: null,
        uid: null,
      },
    });
    const expiredTraining = {
      ...training,
      status: 'Expired',
      sortByExpired: 3,
      sortByExpiresSoon: 2,
      sortByMissing: 2,
    };
    const expiresSoonTraining = {
      ...training,
      status: 'Expires soon',
      sortByExpired: 2,
      sortByExpiresSoon: 3,
      sortByMissing: 1,
    };
    const missingTraining = {
      ...trainingMissing,
      status: 'Missing',
      sortByExpired: 1,
      sortByExpiresSoon: 1,
      sortByMissing: 3,
    };
    const okTraining = {
      ...training,
      status: 'OK',
      sortByExpired: 0,
      sortByExpiresSoon: 0,
      sortByMssing: 0,
    };

    beforeEach(() => {
      request = {
        method: 'GET',
        url: `/api/trainingCategories/${establishmentUid}/${trainingCategoryId}`,
        params: {
          establishmentUid,
          trainingCategoryId,
        },
        query: {
          itemsPerPage: '15',
          pageIndex: '0',
          sortBy: 'trainingExpired',
          searchTerm: '',
        },
      };
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(models.establishment, 'findByUid').returns({ id: 1 });
    });

    it('should return a status of 200 and an object containing the training, the count, the category and isMandatory set to false when not mandatory training', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder()];

      const training = [expiredTraining, expiresSoonTraining, okTraining];

      const trainingArr = training.map((t, index) => {
        const worker = workers[index];
        return {
          ...t,
          worker: {
            NameOrIdValue: worker.NameOrIdValue,
            id: worker.id,
            uid: worker.uid,
            mainJob: {
              id: worker.mainJob.id,
              title: worker.mainJob.title,
            },
          },
        };
      });

      const expectedResponse = {
        category: category.category,
        isMandatory: false,
        trainingCount: 3,
        training: trainingArr,
      };

      sinon.stub(models.MandatoryTraining, 'checkIfTrainingCategoryIsMandatory').returns(null);
      sinon
        .stub(models.workerTraining, 'fetchTrainingByCategoryForEstablishment')
        .returns({ category: category, count: 3, rows: trainingArr });
      await getCategoryTraining(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return a status of 200 and an object containing the training, the count, the category and isMandatory set to true when mandatory training', async () => {
      const workers = [workerBuilder(), workerBuilder(), workerBuilder(), workerBuilder()];

      const training = [expiredTraining, expiresSoonTraining, okTraining, missingTraining];

      const trainingArr = training.map((t, index) => {
        const worker = workers[index];
        return {
          ...t,
          worker: {
            NameOrIdValue: worker.NameOrIdValue,
            id: worker.id,
            uid: worker.uid,
            mainJob: {
              id: worker.mainJob.id,
              title: worker.mainJob.title,
            },
          },
        };
      });

      const expectedResponse = {
        category: category.category,
        isMandatory: true,
        trainingCount: 4,
        training: trainingArr,
      };

      sinon
        .stub(models.MandatoryTraining, 'checkIfTrainingCategoryIsMandatory')
        .returns({ mandatoryTraining: 'mandatoryTraining' });
      sinon
        .stub(models.workerTraining, 'fetchTrainingByCategoryForEstablishment')
        .returns({ category: category, count: 4, rows: trainingArr });
      await getCategoryTraining(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return 400 when there is no establishment uid in the request params', async () => {
      const request400 = cloneDeep(request);
      request400.params.establishmentUid = '';

      const req = httpMocks.createRequest(request400);

      await getCategoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(400);
    });

    it('should return 400 when there is no training category id in the request params', async () => {
      const request400 = cloneDeep(request);
      request400.params.trainingCategoryId = '';

      const req = httpMocks.createRequest(request400);

      await getCategoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(400);
    });

    it('should return 500 when the check mandatory training call throws an error', async () => {
      sinon.restore();
      sinon.stub(models.establishment, 'findByUid').throws();

      await getCategoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 500 when the check mandatory training call throws an error', async () => {
      sinon.stub(models.MandatoryTraining, 'checkIfTrainingCategoryIsMandatory').throws();

      await getCategoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 500 when the fetch training call throws an error', async () => {
      sinon.stub(models.workerTraining, 'fetchTrainingByCategoryForEstablishment').throws();

      await getCategoryTraining(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
