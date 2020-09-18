module.exports.Establishment = {
  parentUid: '4698f4a4-ab82-4906-8b0e-3f4972375927',
  createdByUserUID: '46fab01f-eb35-44ca-a148-6fb73eddb058',
  id: 1,
  uid: '4698f4a4-ab82-4906-8b0e-3f4972375927',
  ownerChangeRequestUID: '46fab01f-eb35-44ca-a148-6fb73eddb058',
  name: 'FAKE TOWN MANOR',
  address: '123 FAKE STREET, FAKE TOWN, KIRKLEES',
  postcode: 'FS13 3LF',
  locationRef: '1-12345678',
  isRegulated: true,
  nmdsId: 'J1002317',
  created: new Date(),
  updated: new Date(),
  updatedBy: 'thisperson',
  mainService: {
    id: 9,
    name: 'Day care and day services',
  },
  employerType: {
    value: '',
    other: '',
  },
  numberOfStaff: 100,
  totalWorkers: 100,
  otherServices: [
    {
      category: 'Adult community care',
      services: [
        { id: 2, name: 'Community support and outreach' },
        { id: 1, name: 'Carers support' },
      ],
    },
  ],
  serviceUsers: [
    {
      id: 1,
      group: 'Older people',
      service: 'Older people with dementia',
    },
    {
      id: 2,
      group: 'Older people',
      service: 'Older people with mental disorders or infirmities, excluding learning disability or dementia',
    },
  ],
  capacities: [
    {
      question: 'How many places do you currently have?',
      questionId: 8,
      seq: 0,
      answer: 65,
    },
    {
      question: 'Number of people using the service on the completion date',
      questionId: 9,
      seq: 0,
      answer: 60,
    },
  ],
  share: { enabled: true, with: ['Local Authority'] },
  localAuthorities: [
    {
      id: 859,
      custodianCode: 211,
      name: 'Kirklees',
      isPrimaryAuthority: true,
    },
  ],
  primaryAuthority: { custodianCode: 211, name: 'Kirklees' },
  parentPermissions: '',
  vacancies: [
    {
      jobId: 1,
      title: '',
      total: 1,
    },
  ],
  totalVacancies: 1,
  starters: [
    {
      jobId: 1,
      title: '',
      total: 1,
    },
  ],
  totalStarters: 1,
  leavers: [
    {
      jobId: 1,
      title: '',
      total: 1,
    },
  ],
  totalLeavers: 1,
  wdf: {
    effectiveFrom: new Date(),
    overalWdfEligible: true,
    lastEligibility: new Date(),
    isEligible: true,
    currentEligibility: true,
    employerType: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    mainService: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    capacities: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    serviceUsers: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    vacancies: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    starters: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    leavers: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
    numberOfStaff: {
      isEligible: 'Yes',
      updatedSinceEffectiveDate: false,
    },
  },
  isParent: true,
  parentName: '',
  dataOwner: 'Parent',
  dataPermissions: 'Workplace and Staff',
  dataOwnershipRequested: '',
  ownershipChangeRequestId: '',
};
