/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Parent training and quals page as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
  });

  it('should see the ');
});
