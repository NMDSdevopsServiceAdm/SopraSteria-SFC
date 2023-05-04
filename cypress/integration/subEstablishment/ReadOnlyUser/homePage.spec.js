/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as read only user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlySubUser'), Cypress.env('userPassword'));
  });

  // placeholder test to make sure the login function is working
  it('should see the admin page', () => {
    cy.contains('Buckden Court');
    cy.contains('Training');
  });

  it('should show all tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should show check your WDF data link', () => {
    cy.get('[data-cy="main-home-links"]').should('contain', 'Check your WDF data');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="main-home-links"]').should('not.contain', 'Bulk upload your data');
  });

  it('should not show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Remove link to my parent organisation');
  });

  it('should not show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Set data permissions');
  });
});
