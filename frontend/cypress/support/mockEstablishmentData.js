export const StandAloneEstablishment = {
  name: 'df',
  id: 180,
  nmdsId: 'J1001043',
  editUserLoginName: Cypress.expose('editStandAloneUser'),
  readOnlyUserLoginName: Cypress.expose('readOnlyStandAloneUser'),
  editUserId: 769,
};

export const ParentEstablishment = {
  name: 'Aster House',
  id: 852,
  nmdsId: 'G1001748',
  editUserLoginName: Cypress.expose('editParentUser'),
  readOnlyUserLoginName: Cypress.expose('readOnlyParentUser'),
};

export const SubEstablishment = {
  name: 'Training',
  id: 915,
  nmdsId: 'J1001811',
  parentName: 'Buckden Court',
  editUserLoginName: Cypress.expose('editSubUser'),
  readOnlyUserLoginName: Cypress.expose('readOnlySubUser'),
};

export const SubEstablishmentNotDataOwner = {
  name: 'Workplace test 1',
  id: 853,
  nmdsId: 'G1001749',
  parentName: ParentEstablishment.name,
  editUserLoginName: Cypress.expose('editSubUserNonDataOwner'),
  readOnlyUserLoginName: Cypress.expose('readOnlySubUserNonDataOwner'),
};

export const MockNewEstablishment = {
  name: 'Test workplace for cypress',
  address: {
    address1: 'Unit 1A, Sunset House',
    address2: 'Sunset Lane',
    address3: 'Sunset District',
    townOrCity: 'Leeds',
    county: 'Leeds',
    postcode: 'LS1 1AA',
  },
};
