const expect = require('chai').expect;
const sinon = require('sinon');

const models = require('../../../../../../models/index');
const otherJobsPropertyClass = require('../../../../../../models/classes/worker/properties/otherJobsProperty')
  .WorkerOtherJobsProperty;

const titles = ['', 'Activities worker or co-ordinator', 'Administrative / office staff not care-providing'];
sinon.stub(models.job, 'findOne').callsFake((args) => {
  return {
    id: args.where.id,
    title: titles[args.where.id],
    other: false,
  };
});

describe('otherJobsProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON with jobs', async () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const document = {
        otherJobs: {
          value: 'Yes',
          jobs: [
            { jobId: 1, title: 'Activities worker or co-ordinator' },
            { jobId: 2, title: 'Administrative / office staff not care-providing' },
          ],
        },
      };
      await otherJobsProperty.restoreFromJson(document);
      expect(otherJobsProperty.property.value).to.deep.equal(document.otherJobs.value);
      expect(Array.isArray(otherJobsProperty.property.jobs)).to.deep.equal(true);
      expect(otherJobsProperty.property.jobs[0].jobId).to.deep.equal(document.otherJobs.jobs[0].jobId);
      expect(otherJobsProperty.property.jobs[1].jobId).to.deep.equal(document.otherJobs.jobs[1].jobId);
      expect(otherJobsProperty.property.jobs[0].title).to.deep.equal(document.otherJobs.jobs[0].title);
      expect(otherJobsProperty.property.jobs[1].title).to.deep.equal(document.otherJobs.jobs[1].title);
    });
    it('should return JSON without jobs', async () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const document = {
        otherJobs: {
          value: 'No',
          jobs: [],
        },
      };
      await otherJobsProperty.restoreFromJson(document);
      expect(otherJobsProperty.property.value).to.deep.equal(document.otherJobs.value);
    });
    it('should return null without a value', async () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const document = {
        otherJobs: {
          value: '',
        },
      };
      await otherJobsProperty.restoreFromJson(document);
      expect(otherJobsProperty.property).to.deep.equal(null);
    });
  });
  describe('restorePropertyFromSequelize()', () => {
    it('should restore in correct format as if from database', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const document = {
        OtherJobsValue: 'Yes',
        otherJobs: [
          { workerJobs: { jobFk: 1 }, title: 'Activities worker or co-ordinator' },
          { workerJobs: { jobFk: 2 }, title: 'Administrative / office staff not care-providing' },
        ],
      };
      const restored = otherJobsProperty.restorePropertyFromSequelize(document);
      expect(restored.value).to.deep.equal(document.OtherJobsValue);
      expect(Array.isArray(restored.jobs)).to.deep.equal(true);
      expect(restored.jobs[0].jobId).to.deep.equal(document.otherJobs[0].workerJobs.jobFk);
      expect(restored.jobs[1].jobId).to.deep.equal(document.otherJobs[1].workerJobs.jobFk);
      expect(restored.jobs[0].title).to.deep.equal(document.otherJobs[0].title);
      expect(restored.jobs[1].title).to.deep.equal(document.otherJobs[1].title);
      expect(restored.jobs[0].other).to.deep.equal(undefined);
      expect(restored.jobs[1].other).to.deep.equal(undefined);
    });
  });
  describe('savePropertyToSequelize()', () => {
    it('should save in correct format as if saving into database', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const otherJobs = {
        value: 'Yes',
        jobs: [
          { jobId: 1, title: 'Activities worker or co-ordinator' },
          { jobId: 2, title: 'Administrative / office staff not care-providing' },
        ],
      };
      otherJobsProperty.property = otherJobs;
      const saved = otherJobsProperty.savePropertyToSequelize();
      expect(saved.OtherJobsValue).to.equal(otherJobs.value);
      expect(Array.isArray(saved.additionalModels.workerJobs)).to.deep.equal(true);
      expect(saved.additionalModels.workerJobs[0].jobFk).to.deep.equal(otherJobs.jobs[0].jobId);
      expect(saved.additionalModels.workerJobs[1].jobFk).to.deep.equal(otherJobs.jobs[1].jobId);
      expect(saved.additionalModels.workerJobs[0].other).to.deep.equal(null);
      expect(saved.additionalModels.workerJobs[1].other).to.deep.equal(null);
    });
    it('should save in correct format as if saving into database if value No', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const otherJobs = {
        value: 'No',
      };
      otherJobsProperty.property = otherJobs;
      const saved = otherJobsProperty.savePropertyToSequelize();
      expect(saved.OtherJobsValue).to.equal(otherJobs.value);
      expect(Array.isArray(saved.additionalModels.workerJobs)).to.deep.equal(true);
      expect(saved.additionalModels.workerJobs.length).to.deep.equal(0);
    });
  });
  describe('isEqual()', () => {
    it('should return true if the values are equal', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const currentValue = {
        value: 'Yes',
      };
      const newValue = {
        value: 'Yes',
      };
      const equal = otherJobsProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return true if the values and jobs are equal', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const currentValue = {
        value: 'Yes',
        jobs: [
          { jobId: 1, title: 'Activities worker or co-ordinator' },
          { jobId: 2, title: 'Administrative / office staff not care-providing' },
        ],
      };
      const newValue = {
        value: 'Yes',
        jobs: [
          { jobId: 1, title: 'Activities worker or co-ordinator' },
          { jobId: 2, title: 'Administrative / office staff not care-providing' },
        ],
      };
      const equal = otherJobsProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(true);
    });
    it('should return false if the values are not equal', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const currentValue = {
        value: 'Yes',
      };
      const newValue = {
        value: 'No',
      };
      const equal = otherJobsProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
    it('should return false if the values and jobs are not equal', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const currentValue = {
        value: 'Yes',
        jobs: [
          { jobId: 1, title: 'Activities worker or co-ordinator' },
          { jobId: 2, title: 'Administrative / office staff not care-providing' },
        ],
      };
      const newValue = {
        value: 'Yes',
        jobs: [{ jobId: 1, title: 'Activities worker or co-ordinator' }],
      };
      const equal = otherJobsProperty.isEqual(currentValue, newValue);
      expect(equal).to.deep.equal(false);
    });
  });
  describe('toJSON()', () => {
    it('should return correctly formatted JSON', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const otherJobs = {
        value: 'Yes',
        jobs: [
          { jobId: 1, title: 'Activities worker or co-ordinator' },
          { jobId: 2, title: 'Administrative / office staff not care-providing' },
        ],
      };
      otherJobsProperty.property = otherJobs;
      const json = otherJobsProperty.toJSON();
      expect(json.otherJobs.value).to.deep.equal(otherJobs.value);
      expect(Array.isArray(json.otherJobs.jobs)).to.deep.equal(true);
      expect(json.otherJobs.jobs[0].jobId).to.deep.equal(otherJobs.jobs[0].jobId);
      expect(json.otherJobs.jobs[1].jobId).to.deep.equal(otherJobs.jobs[1].jobId);
      expect(json.otherJobs.jobs[0].title).to.deep.equal(otherJobs.jobs[0].title);
      expect(json.otherJobs.jobs[1].title).to.deep.equal(otherJobs.jobs[1].title);
    });
  });
  describe('_valid()', () => {
    it('should return false if nothing passed', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const valid = otherJobsProperty._valid();
      expect(valid).to.deep.equal(false);
    });
    it('should return false if there no jobId or title', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const valid = otherJobsProperty._valid({ test: 'Activities worker or co-ordinator' });
      expect(valid).to.deep.equal(false);
    });
    it('should return false if the jobId is not a number', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const valid = otherJobsProperty._valid({ jobId: '1', title: 'Activities worker or co-ordinator' });
      expect(valid).to.deep.equal(false);
    });
    it('should return true if the jobId and title correct', () => {
      const otherJobsProperty = new otherJobsPropertyClass();
      const valid = otherJobsProperty._valid({ jobId: 1, title: 'Activities worker or co-ordinator' });
      expect(valid).to.deep.equal(true);
    });
  });
});
