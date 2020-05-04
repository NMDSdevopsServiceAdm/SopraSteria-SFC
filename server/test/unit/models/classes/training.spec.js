'use strict';
const expect = require('chai').expect;
const sandbox = require('sinon').createSandbox();
const moment = require('moment');
//include Training class
const Training = require('../../../../models/classes/training').Training;


let establishmentId = 123;
let workerRecords = [{
  "id": 9718,
  "uid": "59b6b514-89e0-4248-a62a-bbe721aab8ef",
  "localIdentifier": "Fred",
  "nameOrId": "Fred",
  "contract": "Permanent",
  "mainJob": {
    "jobId": 29,
    "title": "Technician "
  },
  "completed": false,
  "created": "2019-09-03T09:04:05.873Z",
  "updated": "2019-10-24T05:47:09.703Z",
  "updatedBy": "uname70",
  "effectiveFrom": "2019-04-01T00:00:00.000Z",
  "wdfEligible": false
}];

let workerTrainingRecords = {
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
}

describe('/server/models/class/training.js', () => {
  afterEach(function () {
    sandbox.restore();
    console.log("restored fetch");
  });

  before(() => {
    sandbox.stub(Training, 'fetch').callsFake(() => {
      return workerTrainingRecords;
    });
  });

  describe('getExpiringAndExpiredTrainingCounts', () => {
    it('should return updated worker records : Training.getExpiringAndExpiredTrainingCounts', async () => {
      const updateTrainingRecords = await Training.getExpiringAndExpiredTrainingCounts(establishmentId, workerRecords);
      if(updateTrainingRecords){
        expect(updateTrainingRecords[0]).to.have.property('trainingCount');
        expect(updateTrainingRecords[0]).to.have.property('expiredTrainingCount');
        expect(updateTrainingRecords[0]).to.have.property('expiringTrainingCount');
      }
    });

    it('should return updated worker records with expiring training : Training.getExpiringAndExpiredTrainingCounts', async () => {
      workerTrainingRecords.training[0].expires = moment().add(4, 'day').format('YYYY-MM-DD');
      workerRecords[0].expiringTrainingCount = 0;
      const updateTrainingRecords = await Training.getExpiringAndExpiredTrainingCounts(establishmentId, workerRecords);
      if(updateTrainingRecords){
        expect(workerRecords[0].expiringTrainingCount).to.equal(1);
      }
    });

    it('should return updated worker records with blank training records : Training.getExpiringAndExpiredTrainingCounts', async () => {
      workerTrainingRecords.training = [];
      const updateTrainingRecords = await Training.getExpiringAndExpiredTrainingCounts(establishmentId, workerRecords);
      if(updateTrainingRecords){
        expect(updateTrainingRecords[0].trainingCount).to.equal(0);
      }
    });
  });

});
