const dayjs = require('dayjs');
const { TrainingCourseDeliveryMode, TrainingCourseDeliveredBy } = require('../../../../reference/databaseEnumTypes');

exports.mockWorkerTrainingBreakdowns = [
  {
    name: 'Bob Test',
    workplaceName: 'mock care home 1',
    trainingCount: 6,
    mandatoryTrainingCount: 2,
    nonMandatoryTrainingCount: 4,

    expiredTrainingCount: 2,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 2,

    expiringTrainingCount: 4,
    expiringMandatoryTrainingCount: 2,
    expiringNonMandatoryTrainingCount: 2,

    upToDateTrainingCount: 0,
    upToDateMandatoryTrainingCount: 0,
    upToDateNonMandatoryTrainingCount: 0,

    missingMandatoryTrainingCount: 0,
    qualificationCount: 2,
  },
  {
    name: 'Mike test',
    workplaceName: 'mock care home 1',
    trainingCount: 10,
    mandatoryTrainingCount: 5,
    nonMandatoryTrainingCount: 5,

    expiredTrainingCount: 6,
    expiredMandatoryTrainingCount: 3,
    expiredNonMandatoryTrainingCount: 3,

    expiringTrainingCount: 0,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 0,

    upToDateTrainingCount: 4,
    upToDateMandatoryTrainingCount: 2,
    upToDateNonMandatoryTrainingCount: 2,

    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
  },
  {
    name: 'Andrew Test',
    workplaceName: 'mock care home 1',
    trainingCount: 13,
    mandatoryTrainingCount: 3,
    nonMandatoryTrainingCount: 10,

    expiredTrainingCount: 0,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 0,

    expiringTrainingCount: 2,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 2,

    upToDateTrainingCount: 11,
    upToDateMandatoryTrainingCount: 3,
    upToDateNonMandatoryTrainingCount: 8,

    missingMandatoryTrainingCount: 2,
    qualificationCount: 0,
  },
  {
    name: 'Daniel Craig',
    workplaceName: 'mock care home 1',
    trainingCount: 6,
    mandatoryTrainingCount: 1,
    nonMandatoryTrainingCount: 5,

    expiredTrainingCount: 4,
    expiredMandatoryTrainingCount: 1,
    expiredNonMandatoryTrainingCount: 3,

    expiringTrainingCount: 2,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 2,

    upToDateTrainingCount: 0,
    upToDateMandatoryTrainingCount: 0,
    upToDateNonMandatoryTrainingCount: 0,

    missingMandatoryTrainingCount: 3,
    qualificationCount: 0,
  },
];

exports.totalCountsForMockWorkplaceA = {
  trainingCount: 35,
  mandatoryTrainingCount: 11,
  nonMandatoryTrainingCount: 24,

  expiredTrainingCount: 12,
  expiredMandatoryTrainingCount: 4,
  expiredNonMandatoryTrainingCount: 8,

  expiringTrainingCount: 8,
  expiringMandatoryTrainingCount: 2,
  expiringNonMandatoryTrainingCount: 6,

  upToDateTrainingCount: 15,
  upToDateMandatoryTrainingCount: 5,
  upToDateNonMandatoryTrainingCount: 10,

  missingMandatoryTrainingCount: 5,
  qualificationCount: 2,
};

exports.mockWorkerTrainingBreakdownsWithNoMandatoryTraining = [
  {
    name: 'Bob Test',
    workplaceName: 'mock care home no mandatory training',
    trainingCount: 6,
    mandatoryTrainingCount: 0,
    nonMandatoryTrainingCount: 6,
    workplaceHasMandatoryTraining: false,

    expiredTrainingCount: 2,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 2,

    expiringTrainingCount: 4,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 4,

    upToDateTrainingCount: 0,
    upToDateMandatoryTrainingCount: 0,
    upToDateNonMandatoryTrainingCount: 0,

    missingMandatoryTrainingCount: 0,
    qualificationCount: 2,
  },
  {
    name: 'Mike test',
    workplaceName: 'mock care home no mandatory training',
    trainingCount: 10,
    mandatoryTrainingCount: 0,
    nonMandatoryTrainingCount: 10,
    workplaceHasMandatoryTraining: false,

    expiredTrainingCount: 6,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 6,

    expiringTrainingCount: 0,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 0,

    upToDateTrainingCount: 4,
    upToDateMandatoryTrainingCount: 0,
    upToDateNonMandatoryTrainingCount: 4,

    missingMandatoryTrainingCount: 0,
    qualificationCount: 0,
  },
];

exports.secondMockWorkerTrainingBreakdowns = [
  {
    name: 'Jane Test',
    workplaceName: 'mock care home 2',
    trainingCount: 13,
    mandatoryTrainingCount: 5,
    nonMandatoryTrainingCount: 8,

    expiredTrainingCount: 0,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 0,

    expiringTrainingCount: 2,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 2,

    upToDateTrainingCount: 11,
    upToDateMandatoryTrainingCount: 5,
    upToDateNonMandatoryTrainingCount: 6,

    missingMandatoryTrainingCount: 2,
    qualificationCount: 0,
  },
  {
    name: 'John Test',
    workplaceName: 'mock care home 2',

    trainingCount: 10,
    mandatoryTrainingCount: 2,
    nonMandatoryTrainingCount: 8,

    expiredTrainingCount: 4,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 4,

    expiringTrainingCount: 4,
    expiringMandatoryTrainingCount: 2,
    expiringNonMandatoryTrainingCount: 2,

    upToDateTrainingCount: 2,
    upToDateMandatoryTrainingCount: 0,
    upToDateNonMandatoryTrainingCount: 2,

    missingMandatoryTrainingCount: 0,

    qualificationCount: 2,
  },
];

exports.mockWorkerTrainingRecords = [
  {
    name: 'AAPNES East Area Business Support',
    workerRecords: [
      {
        workerId: 'Bob Test',
        jobRole: 'Activities worker or co-ordinator',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being'],
        missingMandatoryTrainings: [],
        trainingRecords: [
          {
            category: 'Activity provision/Well-being',
            categoryFK: 1,
            trainingName: 'Important Training',
            expiryDate: '01/01/2025',
            status: 'Up-to-date',
            dateCompleted: '01/01/2020',
            accredited: 'Yes',
            isMandatory: 'Yes',
            validityPeriodInMonth: null,
            trainingCertificateUploaded: 'Yes',
            deliveredBy: null,
            trainingProviderName: null,
            howWasItDelivered: null,
          },
          {
            category: 'Dementia care',
            categoryFK: 10,
            trainingName: 'Mock Training Name',
            expiryDate: '01/01/2022',
            status: 'Expiring soon',
            dateCompleted: '01/06/2020',
            accredited: 'Yes',
            isMandatory: 'No',
            validityPeriodInMonth: null,
            trainingCertificateUploaded: 'No',
            deliveredBy: null,
            trainingProviderName: null,
            howWasItDelivered: null,
          },
        ],
      },
      {
        workerId: 'Eric Hatfield',
        jobRole: 'Advice, Guidance and Advocacy',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being', 'Diabetes'],
        missingMandatoryTrainings: [
          {
            category: 'Activity provision/Well-being',
            status: 'Missing',
            isMandatory: 'Yes',
          },
        ],
        trainingRecords: [
          {
            category: 'Emergency Aid awareness',
            categoryFK: 14,
            trainingName: 'Practice of Emergency Aid',
            expiryDate: '01/01/2025',
            status: 'Up-to-date',
            dateCompleted: '31/03/2004',
            accredited: 'Yes',

            isMandatory: 'No',
            validityPeriodInMonth: null,
            trainingCertificateUploaded: 'No',
            deliveredBy: null,
            trainingProviderName: null,
            howWasItDelivered: null,
          },
          {
            category: 'Diabetes',
            categoryFK: 11,
            trainingName: 'Training for diabetes',
            expiryDate: '01/01/2019',
            status: 'Expired',
            dateCompleted: '31/03/2012',
            accredited: 'No',

            isMandatory: 'Yes',
            validityPeriodInMonth: null,
            trainingCertificateUploaded: 'No',
            deliveredBy: null,
            trainingProviderName: null,
            howWasItDelivered: null,
          },
        ],
      },
      {
        workerId: 'Terrance Tate',
        jobRole: 'Activities worker or co-ordinator',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being', 'Diabetes'],
        missingMandatoryTrainings: [
          {
            category: 'Activity provision/Well-being',
            status: 'Missing',
            isMandatory: 'Yes',
          },
          {
            category: 'Diabetes',
            status: 'Missing',
            isMandatory: 'Yes',
          },
        ],
        trainingRecords: [],
      },
    ],
  },
];

const mockWorkerQualificationRecords = [
  {
    workerName: 'Helen Jones',
    jobRole: 'Administrative / office staff not care-providing',
    qualificationType: 'Degree',
    qualificationName: 'Health and Social Care degree',
    qualificationLevel: '6',
    yearAchieved: 2020,
  },
  {
    workerName: 'Anna Riley',
    jobRole: 'Care Worker',
    qualificationType: 'Apprenticeship',
    qualificationName: 'Adult Care Worker (standard)',
    qualificationLevel: '3',
    yearAchieved: 2010,
  },
  {
    workerName: 'Bob Smith',
    jobRole: 'Activities worker or co-ordinator',
    qualificationType: 'NVQ',
    qualificationName: 'Care NVQ',
    qualificationLevel: null,
    yearAchieved: null,
  },
];

exports.mockWorkerQualificationRecordsForSingleWorkplace = [
  {
    name: 'Test Workplace 1',
    qualifications: mockWorkerQualificationRecords,
  },
];

exports.mockWorkerQualificationRecordsForParent = [
  {
    name: 'Test Workplace 1',
    qualifications: mockWorkerQualificationRecords,
  },
  {
    name: 'Test Workplace 2',
    qualifications: [],
  },
  {
    name: 'Test Workplace 3',
    qualifications: [
      {
        workerName: 'Lionel Ritchie',
        jobRole: 'Administrator',
        qualificationType: 'Big Hit',
        qualificationName: 'Dancing on the Ceiling',
        qualificationLevel: '2',
        yearAchieved: 2017,
      },
    ],
  },
];

exports.mockWorkersWithCareCertificateStatus = [
  {
    workerId: 'Bob',
    jobRole: 'Care Worker',

    careCertificate: 'Not started',

    l2CareCertificate: 'Not started',
  },

  {
    workerId: 'Mike',
    jobRole: 'Care Coordinator',

    careCertificate: 'Yes, in progress or partially completed',

    l2CareCertificate: 'Yes, completed',
  },
];

exports.mockParentWorkerTrainingRecords = [
  {
    name: 'AAPNES East Area Business Support',
    workerRecords: [
      {
        workerId: 'Bob Test',
        jobRole: 'Activities worker or co-ordinator',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being'],
        trainingRecords: [
          {
            category: 'Activity provision/Well-being',
            categoryFK: 1,
            trainingName: 'Important Training',
            expiryDate: '01/01/2025',
            status: 'Up-to-date',
            dateCompleted: '01/01/2020',
            accredited: 'Yes',
          },
          {
            category: 'Dementia care',
            categoryFK: 10,
            trainingName: 'Mock Training Name',
            expiryDate: '01/01/2022',
            status: 'Expiring soon',
            dateCompleted: '01/06/2020',
            accredited: 'Yes',
          },
        ],
      },
    ],
  },
  {
    name: 'Area Business Support',
    workerRecords: [
      {
        workerId: 'Eric Hatfield',
        jobRole: 'Advice, Guidance and Advocacy',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being', 'Diabetes'],
        trainingRecords: [
          {
            category: 'Emergency Aid awareness',
            categoryFK: 14,
            trainingName: 'Practice of Emergency Aid',
            expiryDate: '01/01/2025',
            status: 'Up-to-date',
            dateCompleted: '31/03/2004',
            accredited: 'Yes',
          },
          {
            category: 'Diabetes',
            categoryFK: 11,
            trainingName: 'Training for diabetes',
            expiryDate: '01/01/2019',
            status: 'Expired',
            dateCompleted: '31/03/2012',
            accredited: 'No',
          },
        ],
      },
    ],
  },
  {
    name: 'AAPNES East Area Business Support',
    workerRecords: [
      {
        workerId: 'Terrance Tate',
        jobRole: 'Activities worker or co-ordinator',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being', 'Diabetes'],
        trainingRecords: [],
      },
    ],
  },
  {
    name: 'Area Business Support',
    workerRecords: [
      {
        workerId: 'Terrance Tate',
        jobRole: 'Activities worker or co-ordinator',
        longTermAbsence: '',
        mandatoryTraining: ['Activity provision/Well-being', 'Diabetes'],
        trainingRecords: [],
      },
    ],
  },
];
exports.secondMockWorkersWithCareCertificateStatus = [
  {
    workerId: 'Bill',
    jobRole: 'Care Worker',
    status: 'Yes, completed',
  },
  {
    workerId: 'Jenny',
    jobRole: 'Care Worker',
    status: 'No',
  },
];

exports.mockEstablishmentsQualificationsResponse = [
  {
    NameValue: 'Workplace Name',
    workers: [
      {
        get() {
          return 'Bob Ross';
        },
        mainJob: {
          id: 1,
          title: 'Activities worker or co-ordinator',
        },
        qualifications: [
          {
            get() {
              return 2020;
            },
            qualification: {
              group: 'NVQ',
              title: 'Care NVQ',
              level: '3',
            },
          },
        ],
      },
      {
        get() {
          return 'Martin Mill';
        },
        mainJob: {
          id: 2,
          title: 'Care Giver',
        },
        qualifications: [
          {
            get() {
              return 2018;
            },
            qualification: {
              group: 'Award',
              title: 'Good Name Award',
              level: '2',
            },
          },
        ],
      },
    ],
  },
  {
    NameValue: 'Subsidiary Workplace Name',
    workers: [
      {
        get() {
          return 'Roly Poly';
        },
        mainJob: {
          id: 3,
          title: 'Roll Connoisseur',
        },
        qualifications: [
          {
            get() {
              return 2020;
            },
            qualification: {
              group: 'Degree',
              title: 'Rolling',
              level: '6',
            },
          },
          {
            get() {
              return 2021;
            },
            qualification: {
              group: 'Degree',
              title: 'Rolling Masters',
              level: '7',
            },
          },
        ],
      },
    ],
  },
];

exports.mockEstablishmentsCareCertificateResponse = [
  {
    id: 1234,
    NameValue: 'Care Home 1',

    workers: [
      {
        NameOrIdValue: 'Bob Ross',
        CareCertificateValue: 'No',
        Level2CareCertificateValue: 'No',

        mainJob: {
          id: 1,
          title: 'Care Worker',
          isCareProvidingRole: true,
        },
        socialCareQualification: {
          level: 'Level 4',
        },
      },

      {
        NameOrIdValue: 'Mike Mill',
        CareCertificateValue: 'Yes, in progress or partially completed',
        Level2CareCertificateValue: 'Yes, completed',

        mainJob: {
          id: 2,
          title: 'Care Coordinator',
          isCareProvidingRole: true,
        },
        socialCareQualification: {
          level: 'Level 8 or above',
        },
      },
    ],
  },

  {
    NameValue: 'Care Home 2',

    workers: [
      {
        NameOrIdValue: 'Bill Bailey',
        CareCertificateValue: 'Yes, completed',
        Level2CareCertificateValue: null,

        mainJob: {
          id: 1,
          title: 'Care Worker',
        },
      },

      {
        NameOrIdValue: 'Jenny Jones',
        CareCertificateValue: 'No',
        Level2CareCertificateValue: 'Yes, started',

        mainJob: {
          id: 1,
          title: 'Care Worker',
        },
      },
    ],
  },
];

const today = dayjs().format('YYYY-MM-DD');
const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
const after90Days = dayjs().add(90, 'days').format('YYYY-MM-DD');
const after89Days = dayjs().add(89, 'days').format('YYYY-MM-DD');

exports.mockEstablishmentsTrainingResponse = [
  {
    id: 2320,
    NameValue: 'Nursing Home',
    expiresSoonAlertDate: '90',

    workers: [
      {
        id: 11169,
        mainJob: { id: 1, title: 'Activities worker or co-ordinator' },
        NameOrIdValue: 'New staff record',
        get(property) {
          if (property === 'mandatoryTrainingCategories') {
            return ['Communication skills'];
          }
        },
        LongTermAbsence: null,

        workerTraining: [
          {
            category: { category: 'Dementia care' },
            expires: yesterday,
            completed: '2020-01-01',
            categoryFk: 10,
            title: 'Great',
            accredited: 'No',

            validityPeriodInMonth: 24,
            trainingCertificatesCount: 1,
            deliveredBy: TrainingCourseDeliveredBy.ExternalProvider,
            trainingProviderName: 'Care skill training',
            howWasItDelivered: TrainingCourseDeliveryMode.FaceToFace,
          },
          {
            category: { category: 'Old age care' },
            expires: after90Days,
            completed: '2020-01-01',
            categoryFk: 5,
            title: 'Old age care training',
            accredited: 'Yes',

            validityPeriodInMonth: 12,
            trainingCertificatesCount: 0,
            deliveredBy: TrainingCourseDeliveredBy.InHouseStaff,
            trainingProviderName: null,
            howWasItDelivered: TrainingCourseDeliveryMode.FaceToFace,
          },
        ],
      },
      {
        id: 1131,
        mainJob: { id: 3, title: 'Care giver' },
        NameOrIdValue: 'Another staff record',
        get(property) {
          if (property === 'mandatoryTrainingCategories') {
            return ['Learning'];
          }
        },
        LongTermAbsence: 'Yes',

        workerTraining: [
          {
            category: { category: 'Learning' },
            expires: after89Days,
            completed: '2020-01-01',
            categoryFk: 10,
            title: 'Test Training',
            accredited: 'No',

            validityPeriodInMonth: null,
            trainingCertificatesCount: 0,
            deliveredBy: TrainingCourseDeliveredBy.ExternalProvider,
            trainingProviderName: null,
            howWasItDelivered: TrainingCourseDeliveryMode.ELearning,
          },
        ],
      },
    ],
  },
  {
    id: 2320,
    NameValue: 'Care Home',
    expiresSoonAlertDate: '90',
    workers: [
      {
        id: 11169,
        mainJob: { id: 1, title: 'Activities worker and care' },
        NameOrIdValue: 'Test staff record',
        get(property) {
          if (property === 'mandatoryTrainingCategories') {
            return ['Autism'];
          }
        },
        LongTermAbsence: null,

        workerTraining: [
          {
            category: { category: 'Dementia care' },
            expires: today,
            completed: '2014-01-01',
            categoryFk: 3,
            title: 'Helen',
            accredited: 'No',

            validityPeriodInMonth: 60,
            trainingCertificatesCount: 2,
            deliveredBy: TrainingCourseDeliveredBy.ExternalProvider,
            trainingProviderName: 'Care skill academy',
            howWasItDelivered: TrainingCourseDeliveryMode.FaceToFace,
          },
        ],
      },
    ],
  },
];
