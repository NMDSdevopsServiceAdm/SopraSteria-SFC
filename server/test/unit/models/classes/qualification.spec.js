'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
//include Qualification class
const Qualification = require('../../../../models/classes/qualification').Qualification;

let establishmentId = 123;
let workerRecords = [{
  "uid": "5bc1270a-4343-4d99-89e2-30ee62766c89",
  "localIdentifier": "Warren Ayling",
  "nameOrId": "Worker",
  "contract": "Pool/Bank",
  "mainJob": {
    "jobId": 21,
    "title": "Other job roles not directly involved in providing care",
    "other": "Backend Engineer"
  },
  "completed": true,
  "created": "2019-07-16T08:51:21.020Z",
  "updated": "2019-09-10T11:18:45.828Z",
  "updatedBy": "aylingw",
  "effectiveFrom": "2019-04-01T00:00:00.000Z",
  "wdfEligible": true,
  "wdfEligibilityLastUpdated": "2019-08-05T10:26:03.820Z"
}];

let workerQualificationRecords = {
  "workerUid": "5bc1270a-4343-4d99-89e2-30ee62766c89",
  "count": 1,
  "lastUpdated": "2019-07-25T09:10:45.388Z",
  "qualifications": [
    {
      "uid": "043b02ab-b95d-416f-adc8-9f28f7342e9b",
      "qualification": {
        "id": 68,
        "group": "Certificate",
        "title": "Working in End of Life care",
        "level": "3"
      },
      "year": 2000,
      "created": "2019-07-25T09:10:45.388Z",
      "updated": "2019-07-25T09:10:45.388Z",
      "updatedBy": "aylingw"
    }
  ]
}

describe('/server/models/class/qualification.js', () => {
  describe('getQualsCounts', () => {
    sinon.stub(Qualification, 'fetch').callsFake(() => {
      return workerQualificationRecords;
    })
    it('should return updated worker records : Qualification.getQualsCounts', async () => {
      const updateWorkerRecords = await Qualification.getQualsCounts(establishmentId, workerRecords);
      if(updateWorkerRecords){
        expect(updateWorkerRecords[0]).to.have.property('qualificationCount');
      }
    });

    it('should return updated worker records with blank qualification : Qualification.getQualsCounts', async () => {
      workerQualificationRecords.qualifications = [];
      const updateWorkerRecords = await Qualification.getQualsCounts(establishmentId, workerRecords);
      if(updateWorkerRecords){
        expect(updateWorkerRecords[0]).to.have.property('qualificationCount');
        expect(updateWorkerRecords[0].qualificationCount).to.equal(0);
      }
    });
  });
});
