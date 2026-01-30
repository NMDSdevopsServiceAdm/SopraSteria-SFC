/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Home page', { tags: '@home' }, () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
  });

  it('should see the standalone establishment home page', () => {
    cy.contains(StandAloneEstablishment.name);
  });

  it('should show all tabs', () => {
    onHomePage.allTabs();
  });

  it('should show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').contains('Bulk upload your data').click();
    cy.url().should('include', 'bulk-upload');
    cy.get('h1').should('contain', 'Bulk upload');
  });

  it('should show funding requirements link', () => {
    cy.get('[data-cy="cards-and-links"]').contains('Does your data meet funding requirements?').click();
    cy.url().should('include', 'funding');
    cy.get('h1').should('contain', 'Does your data meet funding requirements');
  });

  it('should show benchmarks link', () => {
    cy.get('[data-cy="cards-and-links"]').contains('See how you compare against other workplaces').click();
    cy.url().should('include', '#benchmarks');
    cy.get('h1').should('contain', 'Benchmarks');
  });

  it('should have a link to the Benefits Bundle', () => {
    cy.contains('View the ASC-WDS Benefits Bundle').click();
    cy.url().should('include', 'benefits-bundle');
    cy.get('h1').should('contain', 'The ASC-WDS Benefits Bundle');
  });

  it('should have a link to the Certificate', () => {
    cy.contains('Get your ASC-WDS certificate').click();
    cy.url().should('include', 'asc-wds-certificate');
    cy.get('h1').should('contain', 'Get your ASC-WDS certificate');
  });

  it('should have a link to information about the ACS-WDS', () => {
    cy.contains('About ASC-WDS').click();
    cy.url().should('include', 'about-ascwds');
    cy.get('h1').should('contain', 'About ASC-WDS');
  });

  it('should show parent workplace links', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Link to a parent workplace');
    cy.get('[data-cy="home-other-links"]').should('contain', "Become a parent and manage other workplaces' data");
  });
});
