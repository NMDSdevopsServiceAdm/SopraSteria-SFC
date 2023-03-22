/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Admin home page', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  // placeholder test to make sure the login function is working
  it('should see the admin page', () => {
    cy.contains('Admin');
  });
});
