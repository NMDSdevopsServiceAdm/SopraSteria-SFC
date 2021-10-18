const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const { getAllTraining } = require('../../../../../routes/establishments/training');
const buildUser = require('../../../../factories/user');
const Training = require('../../../../../models/classes/training').Training;
const MandatoryTraining = require('../../../../../models/classes/mandatoryTraining').MandatoryTraining;
// const { mockNonMandatoryTraining } = require('../../../mockdata/training');

describe.only('server/routes/establishments/training/index.js', () => {
  const user = buildUser();
//   const record = buildTrainingRecord();

  afterEach(() => {
    sinon.restore();
  });

  describe('getAllTraining', () => {
    let req;
    let res;

    beforeEach(() => {
      const workerId = user.uid;

      const request = {
        method: 'GET',
        url: `/api/establishment/${user.establishmentId}/worker/${workerId}/training`,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon.stub(Training, 'fetch').returns(

        {
          training: [
          {
            id: 10,
            uid: 'someuid',
            workerUid: workerId,
            created: '01/02/2020',
            updated: '01/02/2020',
            updatedBy: 'admin',
            trainingCategory: { id: 1, category: 'Communication'},
            title: 'Communication Training 1',
            accredited: true,
            completed: '01/02/2020',
            expires: '01/02/2021'
          },
          {
            id: 11,
            uid: 'someotheruid',
            workerUid: workerId,
            created: '01/02/2020',
            updated: '01/02/2020',
            updatedBy: 'admin',
            trainingCategory: { id: 2, category: 'Coshh'},
            title: 'Coshh Training 2',
            accredited: true,
            completed: '01/02/2020',
            expires: '01/02/2021'
          }]
        },
      );

      sinon.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').returns([]);
    });

    it('should reply with a status of 200', async () => {
      await getAllTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the data formatted', async () => {
      await getAllTraining(req, res);
      const formattedTraining = await res._getJSONData();

      expect(formattedTraining.mandatory.length).to.equal(0);
      expect(formattedTraining.nonMandatory.length).to.equal(2);
      expect(formattedTraining).to.deep.equal({
        mandatory: [],
        nonMandatory: [
          {
            id: 1,
            category: 'Communication',
            trainingRecords: [{
              uid: 'someuid',
              id: 10,
              workerUid: user.uid,
              created: '01/02/2020',
              updated: '01/02/2020',
              updatedBy: 'admin',
              trainingCategory: { id: 1, category: 'Communication' },
              title: 'Communication Training 1',
              accredited: true,
              completed: '01/02/2020',
              expires: '01/02/2021',
            }]
          },
          {
            id: 2,
            category: 'Coshh',
            trainingRecords: [{
              uid: 'someotheruid',
              id: 11,
              workerUid: user.uid,
              created: '01/02/2020',
              updated: '01/02/2020',
              updatedBy: 'admin',
              trainingCategory: { id: 2, category: 'Coshh' },
              title: 'Coshh Training 2',
              accredited: true,
              completed: '01/02/2020',
              expires: '01/02/2021',
            }]
          }
        ]
      })
    });

    it('should return a 500 error code if an exception is thrown', async () => {
      sinon.restore();

      sinon.stub(Training, 'fetch').throws()

      await getAllTraining(req, res);
      const error = res._getData();

      expect(res.statusCode).to.deep.equal(500);
      expect(error).to.contain('Failed to get TrainingRecords for Worker having uid:');
    });
  });
});