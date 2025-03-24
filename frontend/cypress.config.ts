import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '../.env' });

export const dbConfig = {
  host: process.env.DB_TEST_HOSTNAME ?? '127.0.0.1',
  user: process.env.DB_TEST_USER ?? process.env.POSTGRES_USER,
  password: process.env.DB_TEST_PASS ?? process.env.POSTGRES_PASSWORD,
  database: process.env.DB_TEST_NAME ?? process.env.POSTGRES_DB,
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

        async multipleDbQueries(dbQueries: DbQueryType[]) {
          const client = new Client(dbConfig);
          await client.connect();
          for (const { queryString, parameters } of dbQueries) {
            await client.query(queryString, parameters);
          }
          await client.end();
          return null;
        },
      });
      // implement node event listeners here
    },
  },
});
