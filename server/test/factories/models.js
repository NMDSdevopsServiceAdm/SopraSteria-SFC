const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    NameValue: fake((f) => f.lorem.sentence()),
    address1: fake((f) => f.address.streetAddress()),
    address2: fake((f) => f.address.secondaryAddress()),
    town: fake((f) => f.address.city()),
    postcode: fake((f) => f.address.zipCode('??# #??')),
    county: fake((f) => f.address.county()),
    isParent: false,
    isRegulated: false,
    parentId: null,
    mainService: {
      id: 16,
      name: fake((f) => f.lorem.sentence()),
    },
    otherServices: { value: 'Yes', services: [{ id: 9 }] },
  },
});

const categoryBuilder = build('Category', {
  fields: {
    id: sequence(),
    seq: sequence(),
    category: fake((f) => f.lorem.sentence()),
  },
});

const jobBuilder = build('Job', {
  fields: {
    id: sequence(),
    title: fake((f) => f.lorem.sentence()),
  },
});

const trainingBuilder = build('Training', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    title: fake((f) => f.lorem.sentence()),
    expires: fake((f) => f.date.future(1).toISOString()),
    categoryFk: perBuild(() => {
      return categoryBuilder().id;
    }),
  },
});

const mandatoryTrainingBuilder = build('MandatoryTraining', {
  fields: {
    id: sequence(),
    establishmentFk: perBuild(() => {
      return establishmentBuilder().id;
    }),
    trainingCategoryFK: perBuild(() => {
      return trainingBuilder().id;
    }),
    jobFK: perBuild(() => {
      return jobBuilder().id;
    }),
  },
});

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    NameOrIdValue: fake((f) => f.name.findName()),
    nameOrId: fake((f) => f.name.findName()),
    jobRole: fake((f) => f.name.jobTitle()),
    mainJob: perBuild(() => {
      return jobBuilder();
    }),
    workerTraining: [
      perBuild(() => {
        return trainingBuilder();
      }),
    ],
    wdfEligible: false,
    wdf: {
      isEligible: false
    }
  },
});

const workerBuilderWithWdf = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    NameOrIdValue: fake((f) => f.name.findName()),
    nameOrId: fake((f) => f.name.findName()),
    jobRole: fake((f) => f.name.jobTitle()),
    mainJob: perBuild(() => {
      return jobBuilder();
    }),
    mainJobStartDate: '2020-12-01',
    workerTraining: [
      perBuild(() => {
        return trainingBuilder();
      }),
    ],
    wdfEligible: false,
    wdf: {
      mainJobStartDate: { isEligible: true, updatedSinceEffectiveDate: false },
      daysSick: { isEligible: true, updatedSinceEffectiveDate: false },
      zeroHoursContract: { isEligible: true, updatedSinceEffectiveDate: false },
      weeklyHoursContracted: { isEligible: true, updatedSinceEffectiveDate: false },
      weeklyHoursAverage: { isEligible: true, updatedSinceEffectiveDate: false },
      annualHourlyPay: { isEligible: true, updatedSinceEffectiveDate: false },
      mainJob: { isEligible: true, updatedSinceEffectiveDate: false },
      contract: { isEligible: true, updatedSinceEffectiveDate: false }
    },
  },
});

module.exports.establishmentBuilder = establishmentBuilder;
module.exports.workerBuilder = workerBuilder;
module.exports.jobBuilder = jobBuilder;
module.exports.categoryBuilder = categoryBuilder;
module.exports.trainingBuilder = trainingBuilder;
module.exports.mandatoryTrainingBuilder = mandatoryTrainingBuilder;
module.exports.workerBuilderWithWdf = workerBuilderWithWdf;
