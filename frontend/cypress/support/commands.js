import { v4 as uuidv4 } from 'uuid';

/* eslint-disable no-undef */
Cypress.Commands.add('openLoginPage', () => {
  cy.visit('/');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('POST', '/api/login').as('login');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(Cypress.env('adminUser'));
  cy.get('[data-cy="password"]').type(Cypress.env('userPassword'));
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');
});

Cypress.Commands.add('loginAsUser', (username, password) => {
  cy.intercept('POST', '/api/login').as('login');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');
});

Cypress.Commands.add('getByLabel', (label) => {
  cy.contains('label', label)
    .invoke('attr', 'for')
    .then((id) => {
      cy.get('#' + id);
    });
});

Cypress.Commands.add('deleteTestUserFromDb', (userFullName) => {
  const queryStrings = [
    `DELETE FROM cqc."AddUserTracking"
        USING cqc."User"
        WHERE "AddUserTracking"."UserFK" = "User"."RegistrationID"
        AND "User"."FullNameValue" = $1;
      `,
    `DELETE FROM cqc."UserAudit"
        USING cqc."User"
        WHERE "UserAudit"."UserFK" = "User"."RegistrationID"
        AND "User"."FullNameValue" = $1
        AND "When" >= CURRENT_DATE;`,
    `DELETE FROM cqc."Login"
        USING cqc."User"
        WHERE "Login"."RegistrationID" = "User"."RegistrationID"
        AND "User"."FullNameValue" = $1;`,

    `DELETE FROM cqc."User" WHERE "FullNameValue" = $1;`,
  ];

  const parameters = [userFullName];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('deleteTestWorkplaceFromDb', (workplaceName) => {
  const queryStrings = [
    `DELETE FROM cqc."EstablishmentAudit"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentAudit"."EstablishmentFK"
    AND "Establishment"."NameValue" = $1
    AND "When" >= CURRENT_DATE;`,

    `DELETE FROM "cqc"."Establishment"
    WHERE "NameValue" = $1;`,
  ];
  const parameters = [workplaceName];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

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

Cypress.Commands.add('resetStartersLeaversVacancies', (establishmentID) => {
  const queryStrings = [
    `UPDATE cqc."Establishment"
      SET "NumberOfStaffValue" = 4,
      "VacanciesValue" = null,
      "StartersValue" = null,
      "LeaversValue" = null
      WHERE "EstablishmentID" = $1;`,

    `DELETE FROM cqc."EstablishmentJobs"
    WHERE "EstablishmentID" = $1;`,
  ];
  const parameters = [establishmentID];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('updateStarters', (args) => {
  const { establishmentID = '180', jobId = '10', total = '1' } = args;
  const queryString1 = `UPDATE cqc."Establishment"
      SET "StartersValue" = 'With Jobs'
      WHERE "EstablishmentID" = $1`;

  const parameters1 = [establishmentID];

  const queryString2 = `INSERT INTO cqc."EstablishmentJobs"
      ("EstablishmentID", "JobID", "Total", "JobType")
      VALUES ($1, $2, $3, 'Starters')`;
  const parameters2 = [establishmentID, jobId, total];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 });
  cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
});

Cypress.Commands.add('updateLeavers', (args) => {
  const { establishmentID = '180', jobId = '10', total = '1' } = args;
  const queryString1 = `UPDATE cqc."Establishment"
      SET "LeaversValue" = 'With Jobs'
      WHERE "EstablishmentID" = $1;`;
  const parameters1 = [establishmentID];

  const queryString2 = `INSERT INTO cqc."EstablishmentJobs"
      ("JobID", "EstablishmentID", "JobType", "Total")
      VALUES ($2, $1, 'Leavers', $3);`;
  const parameters2 = [establishmentID, jobId, total];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 });
  cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
});

Cypress.Commands.add('updateVacancies', (args) => {
  const { establishmentID = '180', jobId = '10', total = '1' } = args;
  const queryString1 = `UPDATE cqc."Establishment"
      SET "VacanciesValue" = 'With Jobs'
      WHERE "EstablishmentID" = $1;`;

  const parameters1 = [establishmentID];

  const queryString2 = `INSERT INTO cqc."EstablishmentJobs"
      ("JobID", "EstablishmentID", "JobType", "Total")
      VALUES ($2, $1, 'Vacancies', $3);`;

  const parameters2 = [establishmentID, jobId, total];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 });
  cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
});

Cypress.Commands.add('addJobRoles', (jobRoles) => {
  if (jobRoles?.length > 0) {
    // select job roles
    cy.contains('button', 'Show all job roles').click();

    jobRoles.forEach((jobRole) => {
      cy.getByLabel(jobRole.job).click();
    });

    cy.contains('button', 'Continue').click();
  }
});

Cypress.Commands.add('updateJobRoleTotal', (jobRoles, action) => {
  let jobTotal = 0;
  if (action === 'type') {
    jobRoles.forEach((jobRole) => {
      cy.getByLabel(jobRole.job).as('label');
      cy.get('@label').clear();
      cy.get('@label').type(jobRole.total);
      jobTotal += jobRole.total;
    });
    cy.get('button').first().focus();
    cy.get('[data-testid="total-number"]').contains(jobTotal);
  } else {
    cy.get('[data-testid="total-number"]').contains(jobRoles.length);
  }
});
