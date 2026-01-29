/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Sub home page as edit user where parent owns the data', { tags: '@home' }, () => {
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

  it('should only show links it has permissions for', () => {
    onHomePage.cards();
    onHomePage.otherLinksDefault();

    cy.get('[data-cy="home-other-links"]').should('contain', 'Change data owner');
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove the link to your parent workplace');

    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Change data permissions');
  });
});
