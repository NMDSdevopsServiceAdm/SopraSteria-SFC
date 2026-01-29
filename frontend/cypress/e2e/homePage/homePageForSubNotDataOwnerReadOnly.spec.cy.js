/* eslint-disable no-undef */
/// <reference types="cypress" />

import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Sub home page as read only user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlySubUserNonDataOwner'), Cypress.env('userPassword'));
  });

  it('should see the admin page', () => {
    cy.contains(SubEstablishmentNotDataOwner.parentName);
    cy.contains(SubEstablishmentNotDataOwner.name);
  });

  // waiting for permission fix to be available on test branch
  it('should show all tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should only show links it has permissions for', () => {
    onHomePage.cards();
    onHomePage.otherLinksDefault();

    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Change data permissions');

    // waiting for permission fix to be available on test branch

    // cy.get('[data-cy="home-other-links"]').should('not.contain', 'Remove the link to your parent workplace');
  });
});
