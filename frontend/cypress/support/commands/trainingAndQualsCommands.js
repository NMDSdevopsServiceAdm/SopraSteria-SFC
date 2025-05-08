import { v4 as uuidv4 } from 'uuid';

Cypress.Commands.add('addWorkerTraining', (args) => {
  const { establishmentID = '180', workerName = 'Test worker', categoryId = 4 } = args;

  const queryString1 = `SELECT "ID" FROM cqc."Worker"
  WHERE "EstablishmentFK" = $1
  AND "NameOrIdValue" = $2`;

  const parameters1 = [establishmentID, workerName];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 }).then((result) => {
    cy.wrap(result.rows[0]?.ID).as('workerId');
  });

  cy.get('@workerId').then((workerId) => {
    const queryString2 = `INSERT INTO cqc."WorkerTraining"
  ("UID", "WorkerFK", "CategoryFK", "Title", "Completed", "updatedby")
  VALUES ($1, $2, $3, 'Test Training', '2025-01-01', 'admin1')`;

    const parameters2 = [uuidv4(), workerId, categoryId];

    cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
  });
});

Cypress.Commands.add('deleteWorkerTrainingRecord', (args) => {
  const { establishmentID = '180', workerName = 'Test worker' } = args;

  const queryString1 = `SELECT "ID" FROM cqc."Worker"
  WHERE "EstablishmentFK" = $1
  AND "NameOrIdValue" = $2`;

  const parameters1 = [establishmentID, workerName];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 }).then((result) => {
    cy.wrap(result.rows[0]?.ID).as('workerId');
  });

  cy.get('@workerId').then((workerId) => {
    const queryString2 = `DELETE FROM cqc."WorkerTraining"
    WHERE "WorkerFK" = $1`;

    const parameters2 = [workerId];

    cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
  });
});

Cypress.Commands.add('addWorkerQualification', (args) => {
  const { establishmentID = '180', workerName = 'Test worker', qualificationId = 121 } = args;

  const queryString1 = `SELECT "ID" FROM cqc."Worker"
  WHERE "EstablishmentFK" = $1
  AND "NameOrIdValue" = $2`;

  const parameters1 = [establishmentID, workerName];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 }).then((result) => {
    cy.wrap(result.rows[0]?.ID).as('workerId');
  });

  cy.get('@workerId').then((workerId) => {
    const queryString2 = `INSERT INTO cqc."WorkerQualifications"
  ("UID", "WorkerFK", "QualificationsFK", "Year", "updatedby")
  VALUES ($1, $2, $3, '2024', 'admin1')`;

    const parameters2 = [uuidv4(), workerId, qualificationId];

    cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
  });
});

Cypress.Commands.add('deleteWorkerQualificationsRecord', (args) => {
  const { establishmentID = '180', workerName = 'Test worker' } = args;

  const queryString1 = `SELECT "ID" FROM cqc."Worker"
  WHERE "EstablishmentFK" = $1
  AND "NameOrIdValue" = $2`;

  const parameters1 = [establishmentID, workerName];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 }).then((result) => {
    cy.wrap(result.rows[0]?.ID).as('workerId');
  });

  cy.get('@workerId').then((workerId) => {
    const queryString2 = `DELETE FROM cqc."WorkerQualifications"
    WHERE "WorkerFK" = $1`;

    const parameters2 = [workerId];

    cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
  });
});
