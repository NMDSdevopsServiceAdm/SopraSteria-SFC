import { v4 as uuidv4 } from 'uuid';

Cypress.Commands.add('getNewUserUuidToken', () => {
  const queryString =
    'SELECT "AddUuid" FROM cqc."AddUserTracking" WHERE "Completed" IS NULL ORDER BY "Created" DESC LIMIT 1;';

  return cy.task('dbQuery', { queryString }).its('rows.0.AddUuid');
});

Cypress.Commands.add('insertTestWorker', (args) => {
  const {
    establishmentID = '180',
    workerName = 'Cypress test worker',
    contractType = 'Permanent',
    mainJobFKValue = '10',
    completed = true,
  } = args;
  const queryString = `INSERT INTO cqc."Worker"
    ("WorkerUID", "EstablishmentFK", "NameOrIdValue", "ContractValue", "MainJobFKValue", "CompletedValue", "updatedby")
    VALUES ($1, $2, $3, $4, $5, $6, 'admin1')`;
  const parameters = [uuidv4(), establishmentID, workerName, contractType, mainJobFKValue, completed];

  cy.task('dbQuery', { queryString, parameters });
});

Cypress.Commands.add('deleteTestWorkerFromDb', (workerName) => {
  const queryStrings = [
    `DELETE FROM cqc."WorkerAudit"
      USING cqc."Worker"
        WHERE "Worker"."NameOrIdValue" = $1
        AND "WorkerAudit"."WorkerFK" = "Worker"."ID"
        AND "When" >= CURRENT_DATE;`,
    `DELETE FROM cqc."Worker"
        WHERE "NameOrIdValue" = $1
        AND "created" >= CURRENT_DATE;`,
  ];

  const parameters = [workerName];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('getWorkerId', (establishmentID, workerName) => {
  const queryString = `SELECT "ID" FROM cqc."Worker"
  WHERE "EstablishmentFK" = $1
  AND "NameOrIdValue" = $2`;

  const parameters = [establishmentID, workerName];

  cy.task('dbQuery', { queryString, parameters }).then((result) => {
    cy.wrap(result.rows[0]?.ID).as('workerId');
  });
});
