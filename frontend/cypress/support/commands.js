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
        AND "User"."FullNameValue" = $1;`,
    `DELETE FROM cqc."Login"
        USING cqc."User"
        WHERE "Login"."RegistrationID" = "User"."RegistrationID"
        AND "User"."FullNameValue" = $1;`,

    `DELETE FROM cqc."User" WHERE "FullNameValue" = $1;`,
  ];
  const parameters = [userFullName];
  queryStrings.forEach((queryString) => {
    cy.task('dbQuery', { queryString, parameters });
  });
});

Cypress.Commands.add('deleteTestWorkplaceFromDb', (workplaceName) => {
  const queryStrings = [
    `DELETE FROM cqc."EstablishmentAudit"
    USING cqc."Establishment"
    WHERE "Establishment"."EstablishmentID" = "EstablishmentAudit"."EstablishmentFK"
    AND "Establishment"."NameValue" = $1;`,

    `DELETE FROM "cqc"."Establishment"
    WHERE "NameValue" = $1;`,
  ];

  const parameters = [workplaceName];
  queryStrings.forEach((queryString) => {
    cy.task('dbQuery', { queryString, parameters });
  });
});

Cypress.Commands.add('getNewUserUuidToken', () => {
  const queryString =
    'SELECT "AddUuid" FROM cqc."AddUserTracking" WHERE "Completed" IS NULL ORDER BY "Created" DESC LIMIT 1;';

  return cy.task('dbQuery', { queryString }).its('rows.0.AddUuid');
});

// Cypress.Commands.add('loginAsUser', (username, password) => {
//   // logging into application headlessly
//   const loginCredentials = {
//     username,
//     password,
//   };

//   cy.request('POST', Cypress.env('apiUrl') + 'api/login/', loginCredentials).then((response) => {
//     const token = response.headers.authorization;
//     const establishmentId = response.body.establishment.uid;
//     const agreedUpdatedTerms = response.body.agreedUpdatedTerms;

//     cy.visit('/', {
//       onBeforeLoad(window) {
//         window.localStorage.setItem('auth-token', token);
//         window.localStorage.setItem('establishmentId', establishmentId);
//         window.localStorage.setItem('agreedUpdatedTermsStatus', agreedUpdatedTerms);
//       },
//     });
//   });
// });
