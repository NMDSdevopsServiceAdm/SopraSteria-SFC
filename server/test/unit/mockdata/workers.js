exports.data = [
  {
    localIdentifier: 'My worker',
    nameOrId: 'Dave Smith',
    mainJob: {
      jobId: 23,
      budi: 16,
      other: 'My other Job',
    },
    fluJab: 'No',
    nationalInsuranceNumber: 'JA 123 JK 12',
    postcode: 'LS1 1AA',
    dateOfBirth: '2019-01-01',
    gender: 'Other',
    genderId: 4,
    britishCitizenship: 'No',
    britishCitizenshipId: 2,
    countryOfBirth: 'United Kingdom',
    yearArrived: {
      year: 2019,
    },
    disabiliity: 'Undisclosed',
    disabiliityId: 2,
    careCerticate: 'Yes, completed',
    careCerticateId: 1,
    recruitmentSource: {
      value: 'No',
      budi: 16,
    },
    mainJobStartDate: '2019-01-01',
    socialCareStartDate: {
      value: 'Yes',
      year: 2019,
    },
    apprenticeship: 'Yes',
    apprenticeshipId: 1,
    contract: 'Pool/Bank',
    contractId: 3,
    zeroContractHours: 'Yes',
    zeroContractHoursId: 1,
    contractedHours: {
      value: 'No',
      hours: 0,
    },
    averageHours: {
      value: 'Yes',
      hours: 37,
    },
    otherJobs: {
      value: 'Yes',
      jobs: [
        {
          jobId: 1,
          budi: 34,
          other: 'Developer',
        },
        {
          jobId: 3,
          budi: 11,
          other: 'Tester',
        },
        {
          jobId: 4,
          budi: 17,
          other: 'Dancer',
        },
      ],
    },
    registeredNurse: 'Mental Health Nurse',
    registeredNurseId: '02',
    nurseSpecialism: {
      id: 1,
    },
    approvedMentalHealthWorker: 'No',
    approvedMentalHealthWorkerId: 2,
    socialCareQualification: 'Yes',
    socialCareQualificationId: 1,
    socialCareQualificationLevel: {
      qualificationId: 1,
      budi: 0,
    },
    nonSocialCareQualification: 'Yes',
    nonSocialCareQualificationId: 1,
    nonSocialCareQualificationLevel: {
      qualificationId: 1,
      budi: 0,
    },
    daysSick: {
      value: 'Yes',
      days: 15,
    },
    annualHourlyPay: {
      value: 'Annually',
      rate: 15999,
    },
    ethnicity: {
      ethnicityId: 1,
      budi: 31,
    },
    nationality: {
      value: 'British',
    },
    qualifications: [
      {
        year: 2019,
        qualification: {
          id: 1,
          budi: 20,
        },
        notes: 'My Qualification Notes',
      },
    ],
  },
];

exports.establishmentId = 'My Establishment';
exports.maxquals = 3;
exports.yesNoDontKnow = [
  {
    value: 'No',
    code: '2',
  },
  {
    value: "Don't know",
    code: '999',
  },
  {
    value: 'Yes',
    code: '1',
  },
];

exports.knownHeaders = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'STATUS',
  'DISPLAYID',
  'FLUVAC',
  'NINUMBER',
  'POSTCODE',
  'DOB',
  'GENDER',
  'ETHNICITY',
  'NATIONALITY',
  'BRITISHCITIZENSHIP',
  'COUNTRYOFBIRTH',
  'YEAROFENTRY',
  'DISABLED',
  'CARECERT',
  'RECSOURCE',
  'STARTDATE',
  'STARTINSECT',
  'APPRENTICE',
  'EMPLSTATUS',
  'ZEROHRCONT',
  'DAYSSICK',
  'SALARYINT',
  'SALARY',
  'HOURLYRATE',
  'MAINJOBROLE',
  'MAINJRDESC',
  'CONTHOURS',
  'AVGHOURS',
  'OTHERJOBROLE',
  'OTHERJRDESC',
  'NMCREG',
  'NURSESPEC',
  'AMHP',
  'SCQUAL',
  'NONSCQUAL',
  'QUALACH01',
  'QUALACH01NOTES',
  'QUALACH02',
  'QUALACH02NOTES',
  'QUALACH03',
  'QUALACH03NOTES',
];
