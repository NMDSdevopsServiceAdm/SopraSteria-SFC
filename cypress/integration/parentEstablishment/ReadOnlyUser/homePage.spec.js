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

  it('should see the parent establishment home page', () => {
    cy.contains('Parent');
    cy.contains('Aster House');
  });

  it('should show view all workplaces link', () => {
    cy.get('[data-cy="view-all-workplaces"]').should('contain', 'View all workplaces');
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
