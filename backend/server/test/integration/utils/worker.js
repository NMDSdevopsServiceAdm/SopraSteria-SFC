const faker = require('faker');
const jobsUtils = require('./jobs');
const Random = require('./random');
const { oneOf, fake, build, sequence } = require('@jackfranklin/test-data-bot');

const lookupRandomContract = () => {
  const expectedContractTypeValues = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];
  const randomContractIndex = Random.randomInt(0, expectedContractTypeValues.length - 1);
  return expectedContractTypeValues[randomContractIndex];
};

exports.newWorker = (jobs) => {
  const randomJob = jobsUtils.lookupRandomJob(jobs);
  return {
    nameOrId: faker.lorem.words(1),
    contract: lookupRandomContract(),
    mainJob: {
      jobId: randomJob.id,
      title: randomJob.title,
    },
  };
};

module.exports.apiWorkerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    LocalIdentifierValue: fake((f) => f.lorem.words(1)),
    NameOrIdValue: fake((f) => f.name.findName().replace(/,+/, '')),
    NationalInsuranceNumberValue: 'AB123456C',
    PostcodeValue: fake((f) => f.address.zipCode('??# #??')),
    DateOfBirthValue: fake((f) => f.helpers.replaceSymbolWithNumber('####-##-##')),
    GenderValue: oneOf('Female', 'Male', 'Other', "Don't know"),
    ethnicity: {
      id: fake((f) => f.datatype.number({ min: 1, max: 19 })),
    },
    NationalityValue: oneOf('British', "Don't know", 'Other'),
    BritishCitizenshipValue: oneOf('Yes', 'No', "Don't know"),
    CountryOfBirthValue: oneOf('United Kingdom', "Don't know", 'Other'),
    YearArrivedValue: oneOf('Yes', 'No', "Don't know"),
    DisabilityValue: oneOf('Yes', 'No', "Don't know", 'Undisclosed'),
    CareCertificateValue: oneOf('Yes, completed', 'No', 'Yes, in progress or partially completed'),
    RecruitedFromValue: oneOf('Yes', 'No'),
    MainJobStartDateValue: fake((f) => f.helpers.replaceSymbolWithNumber('####-##-##')),
    recruitedFrom: {
      id: fake((f) => f.datatype.number({ min: 1, max: 10 })),
    },
    SocialCareStartDateValue: oneOf('Yes', 'No'),
    SocialCareStartDateYear: fake((f) => f.helpers.replaceSymbolWithNumber('####')),
    ApprenticeshipTrainingValue: oneOf('Yes', 'No', "Don't know"),
    ContractValue: oneOf('Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'),
    ZeroHoursContractValue: oneOf('Yes', 'No', "Don't know"),
    DaysSickValue: oneOf('Yes', 'No'),
    AnnualHourlyPayValue: oneOf('Hourly', 'Anually'),
    AnnualHourlyPayRate: fake((f) => f.datatype.number({ min: 1, max: 100000 })),
    mainJob: {
      id: fake((f) => f.datatype.number({ min: 1, max: 28 })),
      other: fake((f) => f.datatype.boolean()),
    },
    MainJobFkOther: fake((f) => f.lorem.words(3)),
    WeeklyHoursContractedValue: oneOf('Yes', 'No'),
    WeeklyHoursContractedHours: fake((f) => f.datatype.number({ min: 0, max: 40 })),
    WeeklyHoursAverageValue: oneOf('Yes', 'No'),
    WeeklyHoursAverageHours: fake((f) => f.datatype.number({ min: 0, max: 40 })),
    RegisteredNurseValue: oneOf(
      'Adult Nurse',
      'Mental Health Nurse',
      'Learning Disabilities Nurse',
      "Children's Nurse",
      'Enrolled Nurse',
    ),
    NurseSpecialismsValue: oneOf('Yes', 'No', "Don't know"),
    nurseSpecialisms: [
      {
        id: fake((f) => f.datatype.number({ min: 1, max: 7 })),
      },
    ],
    ApprovedMentalHealthWorkerValue: oneOf('Yes', 'No', "Don't know"),
    QualificationInSocialCareValue: oneOf('Yes', 'No', "Don't know"),
    socialCareQualification: [
      {
        id: fake((f) => f.datatype.number({ min: 1, max: 7 })),
      },
    ],
    OtherQualificationsValue: oneOf('Yes', 'No', "Don't know"),
    highestQualification: [
      {
        id: fake((f) => f.datatype.number({ min: 1, max: 7 })),
      },
    ],
    qualifications: [
      {
        id: fake((f) => f.datatype.number({ min: 1, max: 97 })),
        year: fake((f) => f.helpers.replaceSymbolWithNumber('####')),
        notes: fake((f) => f.lorem.sentence()),
        qualification: {
          id: fake((f) => f.datatype.number({ min: 1, max: 97 })),
        },
      },
    ],
  },
});
