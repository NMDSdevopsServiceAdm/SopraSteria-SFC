const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models/index');
const { workerBuilder, categoryBuilder, trainingBuilder } = require('../../../factories/models');
const workerTrainingCategoriesRoute = require('../../../../routes/workerTrainingCategories');

describe.only('test training categories', () => {
  describe('getTrainingByCategory', () => {
    it('returns a list of training categories that have training', async () => {
      // Arrange
      const category = categoryBuilder();
      const training = trainingBuilder({
        overrides: {
          categoryFk: category.id,
        },
      });
      const worker = workerBuilder({
        overrides: {
          workerTraining: [
            training
          ],
        },
      });

      sinon.stub(models.establishment, 'findByPk').callsFake(() => {
        return {
          id: 123,
          workers: [
            worker,
          ],
        };
      });

      sinon.stub(models.workerTrainingCategories, 'findAll').callsFake(() => {
        return [
          category,
        ];
      });

      const req  = httpMocks.createRequest({
        method: 'GET',
        url: `/api/trainingCategories/123/with-training`,
      });

      const res = httpMocks.createResponse();

      // Act
      await workerTrainingCategoriesRoute.getTrainingByCategory(req, res);

      // Assert
      const { trainingCategories } = res._getJSONData();

      expect(res.statusCode).equals(200);
      expect(trainingCategories.length).equals(1);
      expect(trainingCategories[0].training.length).equals(1);
    });
  });
});
