/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Parent home page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
  });

  it('should see the parent establishment home page', () => {
    cy.contains('Parent');
    cy.contains(ParentEstablishment.name);
  });

  it('should show view all workplaces link', () => {
    cy.get('[data-cy="summary-section"]').should('contain', 'Your other workplaces');
    cy.contains('Your other workplaces').click();
    cy.get('h1').should('contain', 'Your other workplaces');
  });

  it('should show all tabs', () => {
    onHomePage.allTabs();
  });

  it('should show bulk upload link', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Bulk upload your data');
    cy.contains('Bulk upload your data').click();
    cy.get('h1').should('contain', 'Bulk upload');
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

  it('should show bulk upload link', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Bulk upload your data');
    cy.contains('Bulk upload your data').click();
    cy.get('h1').should('contain', 'Bulk upload');
  });

  it('should show ASC-WDS Benefits Bundle', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'View the ASC-WDS Benefits Bundle');
    cy.contains('View the ASC-WDS Benefits Bundle').click();
    cy.get('h1').should('contain', 'The ASC-WDS Benefits Bundle');
  });

  it('should show ASC-WDS Certificate', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Get your ASC-WDS certificate');
    cy.contains('Get your ASC-WDS certificate').click();
    cy.get('h1').should('contain', 'Get your ASC-WDS certificate');
  });

  it('should show ASC-WDS news', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'ASC-WDS news');
    cy.contains('ASC-WDS news').click();
    cy.get('h1').should('contain', 'ASC-WDS news');
  });

  it('should show download reports', () => {
    cy.get('[data-cy="download-report"]').should('exist');
  });
});
