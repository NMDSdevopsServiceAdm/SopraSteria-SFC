/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Parent home page as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
  });

  // placeholder test to make sure the login function is working
  it('should see the admin page', () => {
    cy.contains('Parent');
    cy.contains('Aster House');
  });
});
