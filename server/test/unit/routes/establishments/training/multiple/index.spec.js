const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

const trainingRecords = require('../../../../../../routes/establishments/training/multiple/index');
const buildUser = require('../../../../../factories/user');
const Training = require('../../../../../../models/classes/training').Training;

describe('server/routes/establishments/training/multiple/index.js', () => {
  const user = buildUser();

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    sinon.stub(Training.prototype, 'load');
    sinon.stub(Training.prototype, 'save');
  });

  function createReq() {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: `/api/establishment/${user.establishmentId}/worker/multiple-training`,
      body: {
        workerUids: [1, 2, 3, 4],
        trainingRecord: {
          trainingCategory: {
            id: 1,
          },
          title: 'Zuhals Training',
          accredited: 'Yes',
          completed: '2021-09-01',
          expires: '2022-09-01',
          notes: 'Some test notes',
        },
      },
    });

    return req;
  }

  describe('createMultipleTrainingRecords', () => {
    it('should reply with a status of 200', async () => {
      const req = {
        ...createReq(),
      };

      const res = httpMocks.createResponse();

      await trainingRecords.createMultipleTrainingRecords(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should reply with a total number of training records saved', async () => {
      const req = {
        ...createReq(),
      };

      const res = httpMocks.createResponse();

      await trainingRecords.createMultipleTrainingRecords(req, res);

      expect(res._getData()).to.deep.equal({
        savedRecords: 4,
      });
    });

    it("should reply with a 503 when there's a error", async () => {
      sinon.restore();
      sinon.stub(Training.prototype, 'load').throws();
      sinon.stub(Training.prototype, 'save').throws();
      const req = {
        ...createReq(),
      };

      const res = httpMocks.createResponse();

      await trainingRecords.createMultipleTrainingRecords(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
