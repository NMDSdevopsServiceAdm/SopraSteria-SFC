/* eslint-disable no-undef */
Cypress.Commands.add('openLoginPage', () => {
  cy.visit('/');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/');
  cy.get('[data-cy="username"]').type(Cypress.env('adminUser'));
  cy.get('[data-cy="password"]').type(Cypress.env('userPassword'));
  cy.get('[data-testid="signinButton"]').click();
});

Cypress.Commands.add('loginAsUser', (username, password) => {
  // logging into application headlessly
  const loginCredentials = {
    username,
    password,
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
});
