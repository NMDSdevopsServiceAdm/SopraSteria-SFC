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

  cy.setCookie('cookies_preferences_set', 'true');
  cy.visit('/');
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-testid="signinButton"]').click();
  cy.wait('@login');
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
