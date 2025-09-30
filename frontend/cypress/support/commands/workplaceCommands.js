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

Cypress.Commands.add('resetWorkplaceCWPAnswers', (establishmentID) => {
  const queryStrings = [
    `UPDATE cqc."Establishment"
      SET "CareWorkforcePathwayWorkplaceAwarenessFK" = null,
          "CareWorkforcePathwayUseValue" = null,
          "CWPAwarenessQuestionViewed" = null
      WHERE "EstablishmentID" = $1;`,

    `DELETE FROM cqc."EstablishmentCWPReasons"
     WHERE "EstablishmentID" = $1;`,
  ];
  const parameters = [establishmentID];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('resetWorkplaceDHAAnswers', (establishmentID) => {
  const queryStrings = [
    `UPDATE cqc."Establishment"
      SET "StaffDoDelegatedHealthcareActivitiesValue" = null,
          "StaffWhatKindDelegatedHealthcareActivitiesValue" = null
      WHERE "EstablishmentID" = $1;`,

    `UPDATE cqc."Worker"
      SET "CarryOutDelegatedHealthcareActivitiesValue" = null
      WHERE "EstablishmentFK" = $1;`,

    `DELETE FROM cqc."EstablishmentDHActivities"
     WHERE "EstablishmentID" = $1;`,
  ];
  const parameters = [establishmentID];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('setWorkplaceMainService', (establishmentID, mainServiceId) => {
  const queryString = `UPDATE cqc."Establishment"
      SET "MainServiceFKValue" = $2
      WHERE "EstablishmentID" = $1;`;

  const parameters = [establishmentID, mainServiceId];

  cy.task('dbQuery', { queryString: queryString, parameters: parameters });
});

Cypress.Commands.add('clearWorkplaceWDFAnswers', (establishmentID) => {
  const queryStrings = [
    `UPDATE cqc."Establishment"
        SET
          "VacanciesValue" = null,
          "StartersValue" = null,
          "LeaversValue" = null,
          "NumberOfStaffValue" = 0
      WHERE "EstablishmentID" = $1;`,

    `DELETE FROM cqc."EstablishmentJobs"
      WHERE "EstablishmentID" = $1;`,

    `DELETE FROM cqc."EstablishmentServiceUsers"
      WHERE "EstablishmentID" = $1;`,

    `DELETE FROM cqc."EstablishmentCapacity"
      WHERE "EstablishmentID" = $1;`,
  ];

  const parameters = [establishmentID];
  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

const wdfFieldNames = [
  'EmployerType',
  'MainServiceFK',
  'CapacityServices',
  'ServiceUsers',
  'Vacancies',
  'Starters',
  'Leavers',
  'NumberOfStaff',
];

Cypress.Commands.add('changeWorkplaceWDFAnswersTimestamp', (establishmentID, newDate = '2019-01-01 00:00:00') => {
  let allDateFields = wdfFieldNames.flatMap((field) => [field + 'SavedAt', field + 'ChangedAt']);
  allDateFields.push('EstablishmentWdfEligibility');

  const fieldUpdates = allDateFields.map((field) => `"${field}" = $2`).join(', ');

  const queryString = `
        UPDATE cqc."Establishment"
        SET
          ${fieldUpdates}
      WHERE "EstablishmentID" = $1;
  `;

  const parameters = [establishmentID, newDate];
  cy.task('dbQuery', { queryString: queryString, parameters: parameters });
});

Cypress.Commands.add('insertDummyAnswerForWorkplaceWDFAnswers', (establishmentID) => {
  const queryStrings = [
    `UPDATE cqc."Establishment"
        SET
          "VacanciesValue" = 'None',
          "StartersValue" = 'None',
          "LeaversValue" = 'None',
          "NumberOfStaffValue" = 1
      WHERE "EstablishmentID" = $1;`,

    `INSERT INTO cqc."EstablishmentServiceUsers" ("EstablishmentID", "ServiceUserID")
      VALUES
        ($1, 1),
        ($1, 10);`,

    `INSERT INTO cqc."EstablishmentCapacity" ("EstablishmentID", "ServiceCapacityID", "Answer")
      VALUES
      ($1, 8, 10),
      ($1, 9, 5);`,
  ];

  const parameters = [establishmentID];
  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('resetEstablishmentCapacity', (establishmentID) => {
  const queryString = `DELETE FROM cqc."EstablishmentCapacity"
      WHERE "EstablishmentID" = $1;`;

  const parameters = [establishmentID];

  cy.task('dbQuery', { queryString, parameters });
});

Cypress.Commands.add('resetEstablishmentServiceUsers', (establishmentID) => {
  const queryString = `DELETE FROM cqc."EstablishmentServiceUsers"
      WHERE "EstablishmentID" = $1;`;

  const parameters = [establishmentID];

  cy.task('dbQuery', { queryString, parameters });
});

Cypress.Commands.add('resetNonMandatoryWorkplaceQuestions', (establishmentID) => {
  cy.resetEstablishmentCapacity(establishmentID);
  cy.resetEstablishmentServiceUsers(establishmentID);

  const queryString = `UPDATE cqc."Establishment"
      SET "OtherServicesValue" = null,
      "DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment" = null,
      "WouldYouAcceptCareCertificatesFromPreviousEmployment" = null,
      "CareWorkersCashLoyaltyForFirstTwoYears" = null,
      "SickPay" = null,
      "PensionContribution" = null,
      "CareWorkersLeaveDaysPerYear" = null,
      "ShareDataWithLA" = null
      WHERE "EstablishmentID" = $1;`;

  const parameters = [establishmentID];

  cy.task('dbQuery', { queryString, parameters });
});
