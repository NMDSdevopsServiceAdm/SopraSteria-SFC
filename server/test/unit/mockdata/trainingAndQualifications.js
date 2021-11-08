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
