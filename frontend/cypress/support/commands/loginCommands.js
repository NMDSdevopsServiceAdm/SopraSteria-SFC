/* eslint-disable no-undef */
Cypress.Commands.add('openLoginPage', () => {
  cy.setCookie('cookies_preferences_set', 'true');
  cy.visit('/');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('POST', '/api/login').as('login');

  cy.setCookie('cookies_preferences_set', 'true');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(Cypress.env('adminUser'));
  cy.get('[data-cy="password"]').type(Cypress.env('userPassword'));
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');
});

Cypress.Commands.add('loginAsUser', (username, password) => {
  cy.intercept('POST', '/api/login').as('login');

  cy.updateUserFieldForLoginTests(username, 'TrainingCoursesMessageViewedQuantity', 3);
  cy.setCookie('cookies_preferences_set', 'true');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');
});

Cypress.Commands.add('loginAsUserForInterstitialPages', (username, password) => {
  cy.intercept('POST', '/api/login').as('login');

  cy.setCookie('cookies_preferences_set', 'true');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');

  getPassVacanciesAndTurnoverLoginMessage();
});

Cypress.Commands.add('loginAsUserBeforeApproval', (username, password) => {
  cy.intercept('POST', '/api/login').as('login');

  cy.setCookie('cookies_preferences_set', 'true');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');
});

const getPassVacanciesAndTurnoverLoginMessage = () => {
  cy.get('h1').should('not.contain', 'Sign in');
  cy.get('h1')
    .invoke('text')
    .then((headingText) => {
      if (headingText.includes('Your Workplace vacancies and turnover information')) {
        cy.get('a').contains('Continue').click();
      }
    });
};

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

    'DELETE FROM cqc."User" WHERE "FullNameValue" = $1;',
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

    `DELETE FROM "cqc"."EstablishmentCapacity"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentCapacity"."EstablishmentID"
    AND "Establishment"."NameValue" = $1`,

    `DELETE FROM "cqc"."EstablishmentJobs"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentJobs"."EstablishmentID"
    AND "Establishment"."NameValue" = $1`,

    `DELETE FROM "cqc"."EstablishmentServices"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentServices"."EstablishmentID"
    AND "Establishment"."NameValue" = $1`,

    `DELETE FROM "cqc"."EstablishmentServiceUsers"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentServiceUsers"."EstablishmentID"
    AND "Establishment"."NameValue" = $1`,

    `DELETE FROM cqc."EstablishmentDHActivities"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentDHActivities"."EstablishmentID"
    AND "Establishment"."NameValue" = $1`,

    `DELETE FROM "cqc"."Establishment"
    WHERE "NameValue" = $1;`,
  ];
  const parameters = [workplaceName];

  const dbQueries = queryStrings.map((queryString) => ({ queryString, parameters }));

  cy.task('multipleDbQueries', dbQueries);
});

Cypress.Commands.add('revertUserAttributes', (userFullName = 'editstandalone', userId = 769) => {
  const dateNow = new Date();

  const queryString1 = `UPDATE cqc."User"
      SET "RegistrationSurveyCompleted" = true,
          "LastViewedVacanciesAndTurnoverMessage" = $2,
          "TrainingCoursesMessageViewedQuantity" = 3
      WHERE "FullNameValue" = $1;`;

  const parameters1 = [userFullName, dateNow];

  const queryString2 = `DELETE FROM cqc."RegistrationSurvey"
      WHERE "UserFK" = $1;`;

  const parameters2 = [userId];

  cy.task('dbQuery', { queryString: queryString1, parameters: parameters1 });
  cy.task('dbQuery', { queryString: queryString2, parameters: parameters2 });
});

Cypress.Commands.add('updateUserFieldForLoginTests', (userFullName, fieldNameToUpdate, fieldValueToUpdate) => {
  const allowedFields = [
    'RegistrationSurveyCompleted',
    'TrainingCoursesMessageViewedQuantity',
    'LastViewedVacanciesAndTurnoverMessage',
  ];

  if (allowedFields.includes(fieldNameToUpdate)) {
    const fieldName = `"${fieldNameToUpdate}"`;

    const queryString = `UPDATE cqc."User"
      SET ${fieldName} = $2
      WHERE "FullNameValue" = $1;`;

    const parameters = [userFullName, fieldValueToUpdate];

    cy.task('dbQuery', { queryString: queryString, parameters: parameters });
  }
});
