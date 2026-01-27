/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Standalone home page as edit user', { tags: '@home' }, () => {
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
    cy.get('[data-cy="home-other-links"]').should('contain', 'Bulk upload your data');
  });

  it('should show funding requirements link', () => {
    cy.get('[data-testid="home-tab"]').should('contain', 'Does your data meet funding requirements?');
  });

  it('should show parent workplace links', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Link to a parent workplace');
    cy.get('[data-cy="home-other-links"]').should('contain', "Become a parent and manage other workplaces' data");
  });
});
