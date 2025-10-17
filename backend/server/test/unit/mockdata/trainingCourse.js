const lodash = require('lodash');

const mockTrainingCourses = [
  {
    id: 1,
    uid: 'mock-uid-1',
    establishmentFk: 1105,
    categoryFk: 1,
    name: 'Care skills and knowledge',
    accredited: 'Yes',
    deliveredBy: 'In-house staff',
    externalProviderName: null,
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
    establishmentFk: 1105,
    categoryFk: 2,
    name: 'Specific conditions and disabilities',
    accredited: 'Yes',
    deliveredBy: 'External provider',
    externalProviderName: 'Care skill trainer',
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
    establishmentFk: 1105,
    categoryFk: 1,
    name: 'Care skills and knowledge advanced course',
    accredited: 'Yes',
    deliveredBy: 'External provider',
    externalProviderName: 'Care skill trainer',
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

const expectedTrainingCoursesInResponse = mockTrainingCourses.map((course) => {
  return lodash.mapKeys(course, (_v, key) => {
    switch (key) {
      case 'establishmentFk':
        return 'establishmentId';
      case 'categoryFk':
        return 'trainingCategoryId';
      default:
        return key;
    }
  });
});

module.exports = { mockTrainingCourses, expectedTrainingCoursesInResponse };
