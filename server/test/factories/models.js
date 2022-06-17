const { build, fake, sequence, perBuild } = require('@jackfranklin/test-data-bot');

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
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
    moneySpentOnAdvertisingInTheLastFourWeeks: fake((f) => f.finance.amount(1, 10000, 2)),
    peopleInterviewedInTheLastFourWeeks: fake((f) => f.datatype.number(1000)),
    doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: 'Yes, always',
    wouldYouAcceptCareCertificatesFromPreviousEmployment: 'No, never',
  },
});

const establishment = establishmentBuilder({
  overrides: {
    otherServices: { value: 'Yes', services: [{ category: 'Adult community care', services: [] }] },
  },
});

const establishmentWithWdfBuilder = build('Establishment', {
  fields: {
    ...establishment,
    wdf: {
      mainService: { isEligible: false, updatedSinceEffectiveDate: true },
      starters: { isEligible: false, updatedSinceEffectiveDate: true },
      leavers: { isEligible: false, updatedSinceEffectiveDate: true },
      vacancies: { isEligible: false, updatedSinceEffectiveDate: true },
      capacities: { isEligible: false, updatedSinceEffectiveDate: true },
      serviceUsers: { isEligible: false, updatedSinceEffectiveDate: true },
      numberOfStaff: { isEligible: false, updatedSinceEffectiveDate: true },
      employerType: { isEligible: false, updatedSinceEffectiveDate: true },
    },
  },
});

const establishmentWithShareWith = (shareWith) => {
  const establishment = establishmentBuilder();
  establishment.shareWith = shareWith;
  establishment.otherServices = { value: 'Yes', services: [{ category: 'Adult community care', services: [] }] };
  return establishment;
};

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
    jobRoleName: fake((f) => f.lorem.sentence()),
  },
});

const trainingBuilder = build('Training', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
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
    uid: fake((f) => f.datatype.uuid()),
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
      isEligible: false,
    },
  },
});

const workerBuilderWithWdf = build('WorkerWdf', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
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
    wdfEligible: true,
    wdf: {
      isEligible: true,
      mainJobStartDate: { isEligible: true, updatedSinceEffectiveDate: true },
      daysSick: { isEligible: true, updatedSinceEffectiveDate: true },
      zeroHoursContract: { isEligible: true, updatedSinceEffectiveDate: true },
      weeklyHoursContracted: { isEligible: true, updatedSinceEffectiveDate: true },
      weeklyHoursAverage: { isEligible: true, updatedSinceEffectiveDate: true },
      annualHourlyPay: { isEligible: true, updatedSinceEffectiveDate: true },
      mainJob: { isEligible: true, updatedSinceEffectiveDate: true },
      contract: { isEligible: true, updatedSinceEffectiveDate: true },
      socialCareQualification: { isEligible: true, updatedSinceEffectiveDate: true },
      qualificationInSocialCare: { isEligible: true, updatedSinceEffectiveDate: true },
      careCertificate: { isEligible: true, updatedSinceEffectiveDate: true },
      otherQualification: { isEligible: true, updatedSinceEffectiveDate: true },
      highestQualification: { isEligible: true, updatedSinceEffectiveDate: true },
    },
  },
});

module.exports.establishmentBuilder = establishmentBuilder;
module.exports.establishmentWithWdfBuilder = establishmentWithWdfBuilder;
module.exports.workerBuilder = workerBuilder;
module.exports.jobBuilder = jobBuilder;
module.exports.categoryBuilder = categoryBuilder;
module.exports.trainingBuilder = trainingBuilder;
module.exports.mandatoryTrainingBuilder = mandatoryTrainingBuilder;
module.exports.workerBuilderWithWdf = workerBuilderWithWdf;
module.exports.establishmentWithShareWith = establishmentWithShareWith;
