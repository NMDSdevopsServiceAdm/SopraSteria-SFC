/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishmentNotDataOwner } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as edit user where parent owns the data', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUserNonDataOwner'), Cypress.env('userPassword'));
  });

  it('should see the admin page', () => {
    cy.contains(SubEstablishmentNotDataOwner.parentName);
    cy.contains(SubEstablishmentNotDataOwner.name);
  });

  it('should show all tabs when sub has view workplace and staff records permissions', () => {
    onHomePage.allTabs();
  });

  it('should show funding link', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Does your data meet funding requirements?');
    cy.contains('Does your data meet funding requirements?').click();
    cy.get('h1').should('contain', 'Does your data meet funding requirements');
  });

  it('should show Benchmarks link', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'See how you compare against other workplaces');
    cy.contains('See how you compare against other workplaces').click();
    cy.get('h1').should('contain', 'Benchmarks');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
  });

  it('should show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove the link to your parent workplace');
  });

  it('should not show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Set data permissions');
  });
});
