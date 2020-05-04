const expect = require('chai').expect;
const sandbox = require('sinon').createSandbox();

const trainingRoute = require('../../../routes/establishments/training/index.js');
const Training = require('../../../models/classes/training').Training;
const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;

let establishmentId = 123;

let workerTrainingRecord = {
  "workerUid": "59b6b514-89e0-4248-a62a-bbe721aab8ef",
  "count": 1,
  "lastUpdated": "2019-11-07T03:41:55.870Z",
  "training": [
    {
      "uid": "4240c7ed-eb3a-4a94-8d08-11b4869d0d90",
      "trainingCategory": {
        "id": 14,
        "category": "Emergency Aid awareness"
      },
      "title": "Test 2",
      "accredited": "Yes",
      "completed": "2019-09-12",
      "expires": "2019-10-10",
      "created": "2019-11-07T03:41:55.870Z",
      "updated": "2019-11-07T03:41:55.870Z",
      "updatedBy": "uname70"
    }
  ]
};

let mandatoryTrainingRecords = [
  {
    id: 204,
    establishmentFK: 479,
    trainingCategoryFK: 4,
    jobFK: 1,
    created: new Date("2020-04-30T12:43:43.106Z"),
    updated: new Date("2020-04-30T12:43:43.106Z"),
    createdBy: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
    updatedBy: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
    workerTrainingCategories:
      {
        id: 4,
        category: "Autism"
      }
  },
  {
    id: 101,
    establishmentFK: 479,
    trainingCategoryFK: 14,
    jobFK: 1,
    created: new Date("2020-04-30T12:43:43.106Z"),
    updated: new Date("2020-04-30T12:43:43.106Z"),
    createdBy: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
    updatedBy: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
    workerTrainingCategories: {
      id: 14,
      category: "Emergency Aid awareness"
    }
  }
];

describe.only('training route', () => {
  describe('addMissingMandatoryTrainingToAllTraining', () => {
    afterEach(function () {
      sandbox.restore();
    });

    before(() => {
      sandbox.stub(MandatoryTraining, 'fetchMandatoryTrainingForWorker').callsFake(() => {
        return mandatoryTrainingRecords;
      });
      sandbox.stub(Training, 'fetch').callsFake(() => {
        return workerTrainingRecord;
      });
    });

    it('should return updated training record with missing Mandatory training', async () => {
      const updateStatus = (status) => {
        expect(status).to.deep.equal(200);
      };
      const updateJson = (json) => {
        expect(typeof(json)).to.deep.equal('object');
        expect(json.training[0].uid).to.equal(mandatoryTrainingRecords[0].id);
        expect(json.training[1].uid).to.not.equal(mandatoryTrainingRecords[1].id);
      };
      await trainingRoute.getTrainingListWithMissingMandatoryTraining({
        establishmentId: establishmentId,
        username: 'test123',
        params: {
          workerId: workerTrainingRecord.workerUid
        },
        body: {
          establishmentId: establishmentId
        },
        headers: {
          'x-override-put-return-all': false
        },
      }, {status: updateStatus, json: updateJson, send: updateJson});
    });
  });
});

