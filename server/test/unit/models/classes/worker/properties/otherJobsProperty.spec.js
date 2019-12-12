const expect = require('chai').expect;

const otherJobsPropertyClass = require('../../../../../../models/classes/worker/properties/otherJobsProperty').WorkerOtherJobsProperty;

const otherJobsProperty = new otherJobsPropertyClass();

describe('otherJobsProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return some JSON', async() => {
      const document = {
        otherJobs: {
          value: true,
          jobs: [
            {jobId: 1, title: "Activities worker or co-ordinator"},
            {jobId: 2, title: "Administrative / office staff not care-providing"}
          ]
        }
      };
      await otherJobsProperty.restoreFromJson(document);
    });
    it('should restore in correct format as if from database', () => {
      const document = {
        otherJobs: {
          value: true,
          jobs: [
            {jobId: 1, title: "Activities worker or co-ordinator"},
            {jobId: 2, title: "Administrative / office staff not care-providing"}
          ]
        }
      };
      const restored = otherJobsProperty.restorePropertyFromSequelize(document);
      console.log(restored);
    });
    it('should save in correct format as if saving into database', () => {
      const document = {
        otherJobs: {
          value: true,
          jobs: [
            {jobId: 1, title: "Activities worker or co-ordinator"},
            {jobId: 2, title: "Administrative / office staff not care-providing"}
          ]
        }
      };
      otherJobsProperty.savePropertyToSequelize();
    });
  });
});
