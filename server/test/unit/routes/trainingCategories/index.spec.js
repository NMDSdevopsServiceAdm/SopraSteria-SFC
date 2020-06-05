const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models/index');
const { workerBuilder, categoryBuilder, trainingBuilder, mandatoryTrainingBuilder } = require('../../../factories/models');
const workerTrainingCategoriesRoute = require('../../../../routes/workerTrainingCategories');

describe('test training categories endpoint functions', () => {
  describe('getTrainingByCategory', () => {
    afterEach(() => {
      sinon.restore();
    });

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
      await workerTrainingCategoriesRoute.getTrainingByCategory(req, res);

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
      await workerTrainingCategoriesRoute.getTrainingByCategory(req, res);

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
      await workerTrainingCategoriesRoute.getTrainingByCategory(req, res);

      // Assert
      const { trainingCategories } = res._getJSONData();

      expect(trainingCategories).to.deep.equal([]);
    });
  });
});
