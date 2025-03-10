import { defineConfig } from 'cypress';
import { Client } from 'pg';

export const dbConfig = {
  host: process.env.DB_TEST_HOSTNAME ?? '127.0.0.1',
  user: process.env.DB_TEST_USER ?? 'sfc-test-user',
  password: process.env.DB_TEST_NAME ?? 'sfc-test-pass',
  database: process.env.DB_TEST_NAME ?? 'sfc-test-db',
  port: process.env.DB_TEST_PORT ? parseInt(process.env.DB_TEST_PORT) : 90,
  ssl: false,
};

interface DbQueryType {
  queryString: string;
  parameters?: any[];
}

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
      on('task', {
        async dbQuery({ queryString, parameters }: DbQueryType) {
          const client = new Client(dbConfig);
          await client.connect();
          const res = await client.query(queryString, parameters);
          await client.end();
          return res;
        },
      });
      // implement node event listeners here
    },
  },
});
