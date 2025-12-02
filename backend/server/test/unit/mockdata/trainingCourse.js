const mockTrainingCourses = [
  {
    id: 1,
    uid: 'mock-uid-1',
    categoryFk: 1,
    category: {
      id: 1,
      seq: 0,
      category: 'Activity provision, wellbeing',
      trainingCategoryGroup: 'Care skills and knowledge',
    },
    name: 'Care skills and knowledge',
    accredited: 'Yes',
    deliveredBy: 'In-house staff',
    trainingProviderFk: null,
    trainingProvider: null,
    externalProviderName: null,
    otherTrainingProviderName: null,
    howWasItDelivered: 'Face to face',
    doesNotExpire: false,
    validityPeriodInMonth: 24,
    created: '2025-10-13T12:57:20.737Z',
    updated: '2025-10-13T14:01:35.930Z',
    createdBy: 'admin3',
    updatedBy: 'admin3',
    archived: false,
  },
  {
    id: 2,
    uid: 'mock-uid-2',
    categoryFk: 2,
    category: {
      id: 2,
      seq: 0,
      category: 'Autism',
      trainingCategoryGroup: 'Specific conditions and disabilities',
    },
    name: 'Specific conditions and disabilities',
    accredited: 'Yes',
    deliveredBy: 'External provider',
    trainingProviderFk: 63,
    trainingProvider: { id: 63, name: 'other', isOther: 'true' },
    externalProviderName: 'Care skill trainer',
    otherTrainingProviderName: 'Care skill trainer',
    howWasItDelivered: 'Online',
    doesNotExpire: true,
    validityPeriodInMonth: null,
    created: '2025-10-13T12:57:20.737Z',
    updated: '2025-10-13T14:01:35.930Z',
    createdBy: 'admin3',
    updatedBy: 'admin3',
    archived: false,
  },
  {
    id: 3,
    uid: 'mock-uid-3',
    categoryFk: 1,
    category: {
      id: 1,
      seq: 0,
      category: 'Activity provision, wellbeing',
      trainingCategoryGroup: 'Care skills and knowledge',
    },
    name: 'Care skills and knowledge advanced course',
    accredited: 'Yes',
    deliveredBy: 'External provider',
    trainingProviderFk: 63,
    trainingProvider: { id: 63, name: 'other', isOther: 'true' },
    externalProviderName: 'Care skill trainer',
    otherTrainingProviderName: 'Care skill trainer',
    howWasItDelivered: 'Online',
    doesNotExpire: false,
    validityPeriodInMonth: 36,
    created: '2025-10-13T12:57:20.737Z',
    updated: '2025-10-13T14:01:35.930Z',
    createdBy: 'admin3',
    updatedBy: 'admin3',
    archived: false,
  },
];

const mockTrainingCourseFindAllResult = mockTrainingCourses.map((course) => ({ toJSON: () => course }));

const expectedTrainingCoursesInResponse = mockTrainingCourses.map((course) => {
  const expectedObject = {
    ...course,
    trainingCategoryId: course.categoryFk,
    trainingCategoryName: course.category?.category ?? null,
    trainingProviderId: course.trainingProviderFk,
  };
  delete expectedObject.categoryFk;
  delete expectedObject.trainingProviderFk;

  return expectedObject;
});

const mockTrainingRecords = [
  {
    id: 'training-id-1',
    uid: 'training-uid-1',
    title: 'Activity provision training',
    expires: '2027-12-31',
    categoryFk: 1,
    trainingCourseFK: null,
  },
  {
    id: 'training-id-2',
    uid: 'training-uid-2',
    title: 'Another activity provision training',
    expires: '2030-12-31',
    categoryFk: 1,
    trainingCourseFK: null,
  },
  {
    id: 'training-id-3',
    uid: 'training-uid-3',
    title: 'Activity provision training linked to a course',
    expires: '2030-12-31',
    categoryFk: 1,
    trainingCourseFK: 1,
  },
  {
    id: 'training-id-4',
    uid: 'training-uid-4',
    title: 'Activity provision training',
    expires: '2027-12-31',
    categoryFk: 1,
    trainingCourseFK: null,
  },
  {
    id: 'training-id-5',
    uid: 'training-uid-5',
    title: 'Autism training',
    expires: '2027-12-31',
    categoryFk: 2,
    trainingCourseFK: null,
  },
  {
    id: 'training-id-6',
    uid: 'training-uid-6',
    title: 'Another activity provision training',
    expires: '2030-12-31',
    categoryFk: 1,
    trainingCourseFK: null,
  },
  {
    id: 'training-id-7',
    uid: 'training-uid-7',
    title: 'Autism training linked to a course',
    expires: '2030-12-31',
    categoryFk: 2,
    trainingCourseFK: 2,
  },
];
const mockTrainingRecordObjects = mockTrainingRecords.map((self) => ({ ...self, toJSON: () => self }));

const mockEstablishmentObject = {
  id: 'mock-workplace-id',
  uid: 'mock-workplace-uid',
  workers: [
    {
      id: 'worker-1',
      uid: 'worker-uid-1',
      NameOrIdValue: 'Worker 1',
      mainJob: {},
      workerTraining: [mockTrainingRecordObjects[0], mockTrainingRecordObjects[1], mockTrainingRecordObjects[2]],
    },
    {
      id: 'worker-2',
      uid: 'worker-uid-2',
      NameOrIdValue: 'Worker 2',
      mainJob: {},
      workerTraining: [
        mockTrainingRecordObjects[3],
        mockTrainingRecordObjects[4],
        mockTrainingRecordObjects[5],
        mockTrainingRecordObjects[6],
      ],
    },
  ],
};

const trainingCourseWithLinkableRecords = [
  {
    ...expectedTrainingCoursesInResponse[0],
    linkableTrainingRecords: [
      mockTrainingRecords[0],
      mockTrainingRecords[1],
      mockTrainingRecords[3],
      mockTrainingRecords[5],
    ],
  },
  {
    ...expectedTrainingCoursesInResponse[2],
    linkableTrainingRecords: [
      mockTrainingRecords[0],
      mockTrainingRecords[1],
      mockTrainingRecords[3],
      mockTrainingRecords[5],
    ],
  },
  {
    ...expectedTrainingCoursesInResponse[1],
    linkableTrainingRecords: [mockTrainingRecords[4]],
  },
];

module.exports = {
  mockTrainingCourses,
  mockTrainingCourseFindAllResult,
  expectedTrainingCoursesInResponse,
  mockEstablishmentObject,
  trainingCourseWithLinkableRecords,
};
