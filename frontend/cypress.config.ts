import { defineConfig } from 'cypress';

export default defineConfig({
  env: {
    userPassword: 'Password00!',
    adminUser: 'admin',
    editParentUser: 'editparent',
    readOnlyParentUser: 'readonlyparent',
    editSubUser: 'editsub',
    readOnlySubUser: 'readonlysub',
    editSubUserNonDataOwner: 'editsubnondataowner',
    readOnlySubUserNonDataOwner: 'readonlysubnondataowner',
    editStandAloneUser: 'editstandalone',
    readOnlyStandAloneUser: 'readonlystandalone',
    editParentMainServiceOne: 'editparentmainserviceone',
    editParentMainServiceTwo: 'editparentmainservicetwo',
    editParentMainServiceSix: 'editparentmainservicesix',
    editParentMainServiceEight: 'editparent',
    apiUrl: 'http://localhost:8080/',
  },

  video: false,
  viewportWidth: 1000,
  viewportHeight: 1000,

  e2e: {
    baseUrl: 'http://localhost:8080',
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
