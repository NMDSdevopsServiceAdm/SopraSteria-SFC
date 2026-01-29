/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Standalone home page as read only user', { tags: '@home' }, () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlyStandAloneUser'), Cypress.env('userPassword'));
  });

  it('should see the standalone establishment home page', () => {
    cy.contains(StandAloneEstablishment.name);
  });

  it('should show all tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should only show links it has permissions for', () => {
    onHomePage.cards();
    onHomePage.otherLinksDefault();

    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Link to my parent organisation');
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Become a parent organisation');
  });
});
