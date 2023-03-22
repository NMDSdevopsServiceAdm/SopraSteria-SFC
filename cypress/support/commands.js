/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('openLoginPage', () => {
  cy.visit('/');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/');
  cy.get('[data-cy="username"]').type(Cypress.env('adminUser'));
  cy.get('[data-cy="password"]').type(Cypress.env('adminPassword'));
  cy.get('[data-testid="signinButton"]').click();
});

Cypress.Commands.add('loginToParentAsEditUser', () => {
  // logging into application headlessly
  const loginCredentials = {
    username: Cypress.env('editParentUser'),
    password: Cypress.env('editParentPassword'),
  };

  cy.request('POST', Cypress.env('apiUrl') + 'api/login/', loginCredentials).then((response) => {
    const token = response.headers.authorization;
    const establishmentId = response.body.establishment.uid;
    const agreedUpdatedTerms = response.body.agreedUpdatedTerms;

    cy.visit('/', {
      onBeforeLoad(window) {
        window.localStorage.setItem('auth-token', token);
        window.localStorage.setItem('establishmentId', establishmentId);
        window.localStorage.setItem('agreedUpdatedTermsStatus', agreedUpdatedTerms);
      },
    });
  });

  // to login using the ui

  // cy.visit('/');
  // cy.get('[data-cy="username"]').type(Cypress.env('editParentUser'));
  // cy.get('[data-cy="password"]').type(Cypress.env('editParentPassword'));
  // cy.get('[data-testid="signinButton"]').click();
});
