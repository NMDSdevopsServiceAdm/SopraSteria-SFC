/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Parent home page as read only user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlyParentUser'), Cypress.env('userPassword'));
  });

  // placeholder test to make sure the login function is working
  it('should see the admin page', () => {
    cy.contains('Parent');
    cy.contains('Aster House');
  });

  it('should view all workplaces', () => {
    cy.get('[data-cy="view-all-workplaces"]').click();
    cy.url().should('include', '/workplace/view-all-workplaces');
  });

  it('should show tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should show check your WDF data link', () => {
    cy.get('[data-cy="main-home-links"]').should('contain', 'Check your WDF data');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="main-home-links"]').should('not.contain', 'Bulk upload your data');
  });

  it('should not show download reports', () => {
    cy.get('[data-cy="download-report"]').should('not.exist');
  });
});
