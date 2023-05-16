/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Standalone home page as read only user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlyStandAlonUser'), Cypress.env('userPassword'));
  });

  it('should see the standalone establishment home page', () => {
    cy.contains('df');
  });

  it('should show all tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
  });

  it('should not show WDF requirements link', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Does your data meet WDF requirements?');
  });

  it('should not show parent organisation links', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Link to my parent organisation');
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Become a parent organisation');
  });
});
