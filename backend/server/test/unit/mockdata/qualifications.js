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
      qualificationCertificates: [
        {
          uid: '4c2bdb47-f45a-4d6e-9e0b-ae9e4455559d',
          filename: 'certificate 1.pdf',
          uploadDate: '2021-10-21T14:38:57.449Z',
        },
        {
          uid: '4c2bdb47-f45a-4d6e-9e0b-ae9e4455559e',
          filename: 'certificate 2.pdf',
          uploadDate: '2021-10-21T14:38:57.449Z',
        },
      ],
      created: '2021-10-21T14:38:57.449Z',
      updated: '2021-10-21T14:38:57.449Z',
      updatedBy: 'greenj',
    },
    {
      uid: 'a5fd6fd1-e21e-4510-97a6-ce4a3a0e8423',
      qualification: { id: 74, group: 'Diploma', title: 'Adult Care', level: '4' },
      year: 2020,
      notes: 'Test',
      qualificationCertificates: [],
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
      qualificationCertificates: [],
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
      qualificationCertificates: [],
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
      qualificationCertificates: [],
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
          qualificationCertificates: [
            {
              uid: '4c2bdb47-f45a-4d6e-9e0b-ae9e4455559d',
              filename: 'certificate 1.pdf',
              uploadDate: '2021-10-21T14:38:57.449Z',
            },
            {
              uid: '4c2bdb47-f45a-4d6e-9e0b-ae9e4455559e',
              filename: 'certificate 2.pdf',
              uploadDate: '2021-10-21T14:38:57.449Z',
            },
          ],
          uid: 'fa8f6b14-efd8-4622-b679-14df36202957',
        },
        {
          title: 'Adult Care',
          year: 2020,
          notes: 'Test',
          qualificationCertificates: [],
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
          qualificationCertificates: [],
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
          qualificationCertificates: [],
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
          qualificationCertificates: [],
          uid: '8e34ac81-7fae-4a3b-afd7-18aa85d09b10',
        },
      ],
    },
  ],
};

exports.mockQualificationsRecordWithoutCertificates = {
  uid: 'fa8f6b14-efd8-4622-b679-14df36202957',
  workerUid: '32fa83f9-dc21-4685-82d4-021024c0d5fe',
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
};

exports.mockQualificationsRecordWithCertificates = {
  uid: 'fa8f6b14-efd8-4622-b679-14df36202957',
  workerUid: '32fa83f9-dc21-4685-82d4-021024c0d5fe',
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
  trainingCertificates: [
    {
      uid: 'uid-1',
      filename: 'communication_v1.pdf',
      uploadDate: '2024-04-12T14:44:29.151Z',
    },
    {
      uid: 'uid-2',
      filename: 'communication_v2.pdf',
      uploadDate: '2024-04-12T14:44:29.151Z',
    },
  ],
};
