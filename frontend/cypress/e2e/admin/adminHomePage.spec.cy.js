/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Admin home page', { tags: '@admin' }, () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  // placeholder test to make sure the login function is working
  it('should see the admin page', () => {
    cy.contains('Admin');
  });
});
