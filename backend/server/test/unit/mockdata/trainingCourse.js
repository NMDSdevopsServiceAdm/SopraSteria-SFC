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

module.exports = { mockTrainingCourses, mockTrainingCourseFindAllResult, expectedTrainingCoursesInResponse };
