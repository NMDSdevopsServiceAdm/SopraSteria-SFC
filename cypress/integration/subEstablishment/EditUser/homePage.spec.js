/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
  });

  it('should see the admin page', () => {
    cy.contains('Buckden Court');
    cy.contains('Training');
  });

  it('should show all tabs', () => {
    onHomePage.allTabs();
  });

  it('should show check your WDF data link', () => {
    cy.get('[data-cy="main-home-links"]').should('contain', 'Check your WDF data');
  });

  it('should show bulk upload link', () => {
    cy.get('[data-cy="main-home-links"]').should('contain', 'Bulk upload your data');
  });

  it('should show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove link to my parent organisation');
  });

  it('should show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Set data permissions');
  });
});
