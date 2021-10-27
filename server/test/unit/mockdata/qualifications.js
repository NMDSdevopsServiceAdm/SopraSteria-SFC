exports.mockQualificationRecords = {
  count: 5,
  lastUpdated: '01/01/2020',
  qualifications: [
    {
      uid: 'fa8f6b14-efd8-4622-b679-14df36202957',
      qualification: {
        id: 82,
        group: 'Diploma',
        title: 'Health and Social Care - Dementia',
        level: '2',
      },
      year: 2014,
      notes: 'test note',
      created: '2021-10-21T14:38:57.449Z',
      updated: '2021-10-21T14:38:57.449Z',
      updatedBy: 'greenj',
    },
    {
      uid: 'a5fd6fd1-e21e-4510-97a6-ce4a3a0e8423',
      qualification: { id: 74, group: 'Diploma', title: 'Adult Care', level: '4' },
      year: 2020,
      notes: 'Test',
      created: '2021-10-21T14:10:31.755Z',
      updated: '2021-10-21T14:10:31.755Z',
      updatedBy: 'greenj',
    },
    {
      uid: '8832e33d-515d-40ac-8e75-2bfa93341e13',
      qualification: {
        id: 121,
        group: 'Apprenticeship',
        title: 'Adult Care Worker (standard)',
        level: '2',
      },
      year: 2019,
      notes: 'It helped me do my job',
      created: '2021-10-21T14:09:36.155Z',
      updated: '2021-10-21T14:09:36.155Z',
      updatedBy: 'greenj',
    },
    {
      uid: 'b4832913-29db-414c-89d7-30a73907f425',
      qualification: {
        id: 30,
        group: 'Certificate',
        title: 'Activity Provision in Social Care',
        level: '3',
      },
      year: 2020,
      notes: 'It was great ',
      created: '2021-10-21T14:08:59.685Z',
      updated: '2021-10-21T14:08:59.685Z',
      updatedBy: 'greenj',
    },
    {
      uid: '8e34ac81-7fae-4a3b-afd7-18aa85d09b10',
      qualification: {
        id: 2,
        group: 'Award',
        title: 'Award in Stroke Awareness',
        level: '2',
      },
      year: 2011,
      notes: '',
      created: '2021-10-13T13:04:26.628Z',
      updated: '2021-10-13T13:04:26.628Z',
      updatedBy: 'greenj',
    },
  ],
};

exports.expectedQualificationsSortedByGroup = {
  count: 5,
  lastUpdated: '01/01/2020',
  groups: [
    {
      group: 'Diploma',
      records: [
        {
          title: 'Health and Social Care - Dementia',
          year: 2014,
          notes: 'test note',
          uid: 'fa8f6b14-efd8-4622-b679-14df36202957',
        },
        {
          title: 'Adult Care',
          year: 2020,
          notes: 'Test',
          uid: 'a5fd6fd1-e21e-4510-97a6-ce4a3a0e8423',
        },
      ],
    },
    {
      group: 'Apprenticeship',
      records: [
        {
          title: 'Adult Care Worker (standard)',
          year: 2019,
          notes: 'It helped me do my job',
          uid: '8832e33d-515d-40ac-8e75-2bfa93341e13',
        },
      ],
    },
    {
      group: 'Certificate',
      records: [
        {
          title: 'Activity Provision in Social Care',
          year: 2020,
          notes: 'It was great ',
          uid: 'b4832913-29db-414c-89d7-30a73907f425',
        },
      ],
    },
    {
      group: 'Award',
      records: [
        {
          title: 'Award in Stroke Awareness',
          year: 2011,
          notes: '',
          uid: '8e34ac81-7fae-4a3b-afd7-18aa85d09b10',
        },
      ],
    },
  ],
};
