import { WorkplaceSearchItem } from '@core/model/admin/search.model';

export function buildMockAdminSearchWorkplace(isLocked = false): WorkplaceSearchItem {
  return {
    address1: '1 THE LANE',
    address2: '',
    county: 'HAMPSHIRE',
    dataOwner: 'Workplace',
    employerType: { value: 'Voluntary / Charity', other: null },
    isParent: false,
    isRegulated: false,
    lastUpdated: new Date('11/26/2021'),
    locationId: '1-1111111111',
    providerId: '1-2222222222',
    name: 'The One and Only',
    nmdsId: 'H1003112',
    parent: {
      uid: 'c1231-b13-40d3-4141-ad77f40f4629',
      nmdsId: 'A1234567',
    },
    postcode: 'ABC123',
    town: 'SOMEWHERE TOWN',
    uid: 'c93920e7-b373-40d3-8202-ad77f40f4629',
    users: [
      {
        isLocked,
        name: 'Bob Bobson',
        securityAnswer: 'Blue maybe',
        securityQuestion: 'What is your favourite colour?',
        uid: '60a22dd6-7fe0-4105-93f0-34946917768c',
        username: 'bobby',
      },
    ],
    notes: [
      {
        createdAt: new Date('01/25/2021'),
        note: 'This is a note',
        user: { FullNameValue: 'Admin 1' },
      },
    ],
  } as WorkplaceSearchItem;
}
