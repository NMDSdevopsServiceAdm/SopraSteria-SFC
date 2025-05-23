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

Cypress.Commands.add('archiveAllWorkersInWorkplace', (establishmentID) => {
  const queryString = `UPDATE cqc."Worker"
      SET "Archived" = 'true'
      WHERE "EstablishmentFK" = $1;`;

  const parameters = [establishmentID];

  cy.task('dbQuery', { queryString: queryString, parameters: parameters });
});
