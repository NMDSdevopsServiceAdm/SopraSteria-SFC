exports.mockWorkerTrainingBreakdowns = [
  {
    name: 'Bob Test',
    trainingCount: 6,
    qualificationCount: 2,
    expiredTrainingCount: 2,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 2,
    expiringTrainingCount: 4,
    expiringMandatoryTrainingCount: 2,
    expiringNonMandatoryTrainingCount: 2,
    missingMandatoryTrainingCount: 0,
    mandatoryTrainingCount: 0,
  },
  {
    name: 'Mike test',
    trainingCount: 10,
    qualificationCount: 0,
    expiredTrainingCount: 6,
    expiredMandatoryTrainingCount: 3,
    expiredNonMandatoryTrainingCount: 3,
    expiringTrainingCount: 0,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    mandatoryTrainingCount: 5,
  },
  {
    name: 'Andrew Test',
    trainingCount: 13,
    qualificationCount: 0,
    expiredTrainingCount: 0,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 0,
    expiringTrainingCount: 2,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 2,
    missingMandatoryTrainingCount: 2,
    mandatoryTrainingCount: 3,
  },
  {
    name: 'Daniel Craig',
    trainingCount: 6,
    qualificationCount: 0,
    expiredTrainingCount: 4,
    expiredMandatoryTrainingCount: 1,
    expiredNonMandatoryTrainingCount: 3,
    expiringTrainingCount: 2,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 2,
    missingMandatoryTrainingCount: 3,
    mandatoryTrainingCount: 3,
  },
];

exports.secondMockWorkerTrainingBreakdowns = [
  {
    name: 'Jane Test',
    trainingCount: 13,
    qualificationCount: 0,
    expiredTrainingCount: 0,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 0,
    expiringTrainingCount: 2,
    expiringMandatoryTrainingCount: 0,
    expiringNonMandatoryTrainingCount: 2,
    missingMandatoryTrainingCount: 2,
    mandatoryTrainingCount: 3,
  },
  {
    name: 'John Test',
    trainingCount: 10,
    qualificationCount: 2,
    expiredTrainingCount: 4,
    expiredMandatoryTrainingCount: 0,
    expiredNonMandatoryTrainingCount: 2,
    expiringTrainingCount: 4,
    expiringMandatoryTrainingCount: 2,
    expiringNonMandatoryTrainingCount: 2,
    missingMandatoryTrainingCount: 0,
    mandatoryTrainingCount: 4,
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
    status: 'No',
  },
  {
    workerId: 'Mike',
    jobRole: 'Care Coordinator',
    status: 'Yes, in progress or partially completed',
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
    get() {
      return 'Care Home 1';
    },
    workers: [
      {
        get(property) {
          return property === 'NameOrIdValue' ? 'Bob Ross' : 'No';
        },
        mainJob: {
          id: 1,
          title: 'Care Worker',
        },
      },
      {
        get(property) {
          return property === 'NameOrIdValue' ? 'Mike Mill' : 'Yes, in progress or partially completed';
        },
        mainJob: {
          id: 2,
          title: 'Care Coordinator',
        },
      },
    ],
  },
  {
    get() {
      return 'Care Home 2';
    },
    workers: [
      {
        get(property) {
          return property === 'NameOrIdValue' ? 'Bill Bailey' : 'Yes, completed';
        },
        mainJob: {
          id: 1,
          title: 'Care Worker',
        },
      },
      {
        get(property) {
          return property === 'NameOrIdValue' ? 'Jenny Jones' : 'No';
        },
        mainJob: {
          id: 1,
          title: 'Care Worker',
        },
      },
    ],
  },
];

exports.mockEstablishmentsTrainingResponse = [
  {
    id: 2320,
    NameValue: 'Nursing Home',
    get() {
      return '90';
    },
    workers: [
      {
        id: 11169,
        mainJob: { id: 1, title: 'Activities worker or co-ordinator' },
        get(property) {
          if (property === 'NameOrIdValue') return 'New staff record';
          if (property === 'mandatoryTrainingCategories') return ['Communication skills'];
          if (property === 'LongTermAbsence') return null;
        },
        workerTraining: [
          {
            get(property) {
              if (property === 'category') return { category: 'Dementia care' };
              if (property === 'Expires') {
                const expiryDate = new Date(new Date().setHours(0, 0, 0, 0));
                return expiryDate.setDate(expiryDate.getDate() - 1);
              }
              if (property === 'Completed') return '2020-01-01';
              if (property === 'CategoryFK') return 10;
              if (property === 'Title') return 'Great';
              if (property === 'Accredited') return 'No';
            },
          },
          {
            get(property) {
              if (property === 'category') return { category: 'Old age care' };
              if (property === 'Expires') {
                const expiryDate = new Date(new Date().setHours(0, 0, 0, 0));
                return expiryDate.setDate(expiryDate.getDate() + 90);
              }
              if (property === 'Completed') return '2020-01-01';
              if (property === 'CategoryFK') return 5;
              if (property === 'Title') return 'Old age care training';
              if (property === 'Accredited') return 'Yes';
            },
          },
        ],
      },
      {
        id: 1131,
        mainJob: { id: 3, title: 'Care giver' },
        get(property) {
          if (property === 'NameOrIdValue') return 'Another staff record';
          if (property === 'mandatoryTrainingCategories') return ['Learning'];
          if (property === 'LongTermAbsence') return 'Yes';
        },
        workerTraining: [
          {
            get(property) {
              if (property === 'category') return { category: 'Learning' };
              if (property === 'Expires') {
                const expiryDate = new Date(new Date().setHours(0, 0, 0, 0));
                return expiryDate.setDate(expiryDate.getDate() + 89);
              }
              if (property === 'Completed') return '2020-01-01';
              if (property === 'CategoryFK') return 10;
              if (property === 'Title') return 'Test Training';
              if (property === 'Accredited') return 'No';
            },
          },
        ],
      },
    ],
  },
  {
    id: 2320,
    NameValue: 'Care Home',
    get() {
      return '90';
    },
    workers: [
      {
        id: 11169,
        mainJob: { id: 1, title: 'Activities worker and care' },
        get(property) {
          if (property === 'NameOrIdValue') return 'Test staff record';
          if (property === 'mandatoryTrainingCategories') return ['Autism'];
          if (property === 'LongTermAbsence') return null;
        },
        workerTraining: [
          {
            get(property) {
              if (property === 'category') return { category: 'Dementia care' };
              if (property === 'Expires') {
                const expiryDate = new Date(new Date().setHours(0, 0, 0, 0));
                return expiryDate.setDate(expiryDate.getDate());
              }
              if (property === 'Completed') return '2014-01-01';
              if (property === 'CategoryFK') return 3;
              if (property === 'Title') return 'Helen';
              if (property === 'Accredited') return 'No';
            },
          },
        ],
      },
    ],
  },
];
