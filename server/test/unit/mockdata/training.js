exports.knownHeaders = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'CATEGORY',
  'DESCRIPTION',
  'DATECOMPLETED',
  'EXPIRYDATE',
  'ACCREDITED',
  'NOTES',
];

exports.mockTrainingRecord = {
  id: 10,
  uid: 'someuid',
  workerUid: '6787fgfghfghghjjg',
  created: '01/02/2020',
  updated: '01/02/2020',
  updatedBy: 'admin',
  trainingCategory: { id: 1, category: 'Communication' },
  title: 'Communication Training 1',
  accredited: true,
  completed: '01/02/2020',
  expires: '01/02/2021',
};

exports.mockTrainingRecords = [
  {
    id: 10,
    uid: 'someuid',
    workerUid: '6787fgfghfghghjjg',
    created: '01/02/2020',
    updated: '01/02/2020',
    updatedBy: 'admin',
    trainingCategory: { id: 1, category: 'Communication' },
    title: 'Communication Training 1',
    accredited: true,
    completed: '01/02/2020',
    expires: '01/02/2021',
  },
  {
    id: 11,
    uid: 'someotheruid',
    workerUid: 'hdfhdfg688',
    created: '01/02/2020',
    updated: '01/02/2020',
    updatedBy: 'admin',
    trainingCategory: { id: 2, category: 'Coshh' },
    title: 'Coshh Training 1',
    accredited: true,
    completed: '01/02/2020',
    expires: '01/02/2021',
  },
  {
    id: 12,
    uid: 'someotherCoshhuid',
    workerUid: 'hdfhdfg113',
    created: '01/02/2020',
    updated: '01/02/2020',
    updatedBy: 'admin',
    trainingCategory: { id: 2, category: 'Coshh' },
    title: 'Coshh Training 2',
    accredited: true,
    completed: '01/02/2020',
    expires: '01/02/2021',
  },
  {
    id: 13,
    uid: 'someHazardUid',
    workerUid: '9087fgfghfghghjjg',
    created: '01/02/2020',
    updated: '01/02/2020',
    updatedBy: 'admin',
    trainingCategory: { id: 3, category: 'Hazards' },
    title: 'Hazard Training 1',
    accredited: true,
    completed: '01/02/2020',
    expires: '01/02/2021',
  },
];

exports.mockFormattedTraining = [
  {
    id: 1,
    category: 'Communication',
    trainingRecords: [
      {
        uid: 'someuid',
        id: 10,
        workerUid: '6787fgfghfghghjjg',
        created: '01/02/2020',
        updated: '01/02/2020',
        updatedBy: 'admin',
        trainingCategory: { id: 1, category: 'Communication' },
        title: 'Communication Training 1',
        accredited: true,
        completed: '01/02/2020',
        expires: '01/02/2021',
      },
    ],
  },
  {
    id: 2,
    category: 'Coshh',
    trainingRecords: [
      {
        uid: 'someotheruid',
        id: 11,
        workerUid: 'hdfhdfg688',
        created: '01/02/2020',
        updated: '01/02/2020',
        updatedBy: 'admin',
        trainingCategory: { id: 2, category: 'Coshh' },
        title: 'Coshh Training 1',
        accredited: true,
        completed: '01/02/2020',
        expires: '01/02/2021',
      },
      {
        uid: 'someotherCoshhuid',
        id: 12,
        workerUid: 'hdfhdfg113',
        created: '01/02/2020',
        updated: '01/02/2020',
        updatedBy: 'admin',
        trainingCategory: { id: 2, category: 'Coshh' },
        title: 'Coshh Training 2',
        accredited: true,
        completed: '01/02/2020',
        expires: '01/02/2021',
      },
    ],
  },
  {
    id: 3,
    category: 'Hazards',
    trainingRecords: [
      {
        uid: 'someHazardUid',
        id: 13,
        workerUid: '9087fgfghfghghjjg',
        created: '01/02/2020',
        updated: '01/02/2020',
        updatedBy: 'admin',
        trainingCategory: { id: 3, category: 'Hazards' },
        title: 'Hazard Training 1',
        accredited: true,
        completed: '01/02/2020',
        expires: '01/02/2021',
      },
    ],
  },
];

exports.mockMandatoryTraining = [
  {
    establishmentFK: 1234,
    trainingCategoryFK: 1,
    jobFK: 2,
    created: '01/02/2020',
    updated: '01/02/2020',
    createdBy: 'admin',
    updatedBy: 'admin',
    workerTrainingCategories: {
      id: 1,
      category: 'Communication',
    },
  },
  {
    establishmentFK: 1234,
    trainingCategoryFK: 2,
    jobFK: 2,
    created: '01/02/2020',
    updated: '01/02/2020',
    createdBy: 'admin',
    updatedBy: 'admin',
    workerTrainingCategories: {
      id: 2,
      category: 'Coshh',
    },
  },
  {
    establishmentFK: 1234,
    trainingCategoryFK: 3,
    jobFK: 2,
    created: '01/02/2020',
    updated: '01/02/2020',
    createdBy: 'admin',
    updatedBy: 'admin',
    workerTrainingCategories: {
      id: 3,
      category: 'Hazards',
    },
  },
];

exports.mockMissingMandatoryTraining = [
  {
    id: 1,
    uid: 'worker-uid1',
    NameOrIdValue: 'Someone',
    mainJob: {
      id: 15,
      other: false,
      title: 'Advisor',
      MandatoryTraining: [
        {
          TrainingCategoryFK: 9,
          created: '01/02/2022',
          createdBy: 'admin',
          establishmentFK: 23,
          id: 4,
          jobFK: 15,
          updated: '01/02/2022',
          updatedBy: 'admin',
          workerTrainingCategories: {
            get() {
              return {
                category: 'Autism',
                id: 9,
                seq: 11,
              };
            },
          },
        },
      ],
    },
  },
  {
    id: 2,
    uid: 'worker-uid2',
    NameOrIdValue: 'Another',
    mainJob: {
      id: 5,
      other: false,
      title: 'Nurse',
      MandatoryTraining: [
        {
          TrainingCategoryFK: 9,
          created: '01/02/2022',
          createdBy: 'admin',
          establishmentFK: 23,
          id: 4,
          jobFK: 5,
          updated: '01/02/2022',
          updatedBy: 'admin',
          workerTrainingCategories: {
            get() {
              return {
                category: 'Autism',
                id: 9,
                seq: 11,
              };
            },
          },
        },
        {
          TrainingCategoryFK: 5,
          created: '01/02/2022',
          createdBy: 'admin',
          establishmentFK: 23,
          id: 4,
          jobFK: 5,
          updated: '01/02/2022',
          updatedBy: 'admin',
          workerTrainingCategories: {
            get() {
              return {
                category: 'COSHH',
                id: 5,
                seq: 11,
              };
            },
          },
        },
      ],
    },
  },
];

exports.mockExpiredTrainingRecords = [
  {
    NameOrIdValue: 'Person 1',
    id: 34,
    uid: 'mock-uid-1',
    workerTraining: [
      {
        category: {
          id: 1,
          category: 'Some category',
        },
        categoryFk: 1,
        expires: '01/02/2022',
        uid: 'training-uid-1',
      },
      {
        category: {
          id: 2,
          category: 'Different category',
        },
        categoryFk: 2,
        expires: '01/02/2022',
        uid: 'training-uid-2',
      },
    ],
  },
  {
    NameOrIdValue: 'Person 2',
    id: 45,
    uid: 'mock-uid-2',
    workerTraining: [
      {
        category: {
          id: 5,
          category: 'Another category',
        },
        categoryFk: 5,
        expires: '01/02/2022',
        uid: 'training-uid-3',
      },
    ],
  },
  {
    NameOrIdValue: 'Person 3',
    id: 79,
    uid: 'mock-uid-3',
    workerTraining: [
      {
        category: {
          id: 1,
          category: 'Some category',
        },
        categoryFk: 1,
        expires: '01/02/2022',
        uid: 'training-uid-4',
      },
    ],
  },
];
