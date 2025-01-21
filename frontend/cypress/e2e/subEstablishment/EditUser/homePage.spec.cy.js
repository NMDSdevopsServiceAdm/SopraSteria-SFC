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

  it('should see the sub establishment home page', () => {
    cy.contains('Buckden Court');
    cy.contains('Training');
  });

  it('should show all tabs', () => {
    onHomePage.allTabs();
  });

  it('should show link to funding requirements', () => {
    cy.get('[data-testid="home-tab"]').should('contain', 'Does your data meet funding requirements?');
  });

  it('should show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Bulk upload your data');
  });

  it('should show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove the link to your parent workplace');
  });

  it('should show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Set data permissions');
  });
});
