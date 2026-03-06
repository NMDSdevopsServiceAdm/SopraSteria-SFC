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

  describe('Admin reports', () => {
    it('should display the admin reports', () => {
      cy.contains('Admin reports').click();

      cy.contains('Admin local authority progress');
      cy.contains('Deletion report');
      cy.contains('Registration survey');
      cy.contains('Satisfaction survey');
      cy.contains('User research invite responses report');
      cy.contains('WDF summary report');
    });
  });
});
