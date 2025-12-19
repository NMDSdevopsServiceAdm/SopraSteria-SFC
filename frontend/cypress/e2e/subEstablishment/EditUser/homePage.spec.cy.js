/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
  });

  it('should see the sub establishment home page', () => {
    cy.contains(SubEstablishment.parentName);
    cy.contains(SubEstablishment.name);
  });

  it('should show all tabs', () => {
    onHomePage.allTabs();
  });

  it('should show link to funding requirements', () => {
    cy.get('[data-testid="home-tab"]').should('contain', 'Does your data meet funding requirements?');
    cy.contains('Does your data meet funding requirements?').click();
    cy.get('h1').should('contain', 'Does your data meet funding requirements');
  });

  it('should show Benchmarks link', () => {
    cy.get('[data-testid="home-tab"]').should('contain', 'See how you compare against other workplaces');
    cy.contains('See how you compare against other workplaces').click();
    cy.get('h1').should('contain', 'Benchmarks');
  });

  it('should show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Bulk upload your data');
    cy.contains('Bulk upload your data').click();
    cy.get('h1').should('contain', 'Bulk upload');
  });

  it('should show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove the link to your parent workplace');
  });

  it('should show change data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Change data permissions');
  });
});
