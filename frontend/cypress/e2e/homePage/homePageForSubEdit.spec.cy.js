/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Sub home page as edit user', { tags: '@home' }, () => {
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

  it('should show the correct cards and links', () => {
    onHomePage.cards();
    onHomePage.otherLinksDefault();

    cy.get('[data-cy="home-other-links"]').should('contain', 'Change data permissions');
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove the link to your parent workplace');
    cy.get('[data-cy="home-other-links"]').should('contain', 'Bulk upload your data');
  });
});
