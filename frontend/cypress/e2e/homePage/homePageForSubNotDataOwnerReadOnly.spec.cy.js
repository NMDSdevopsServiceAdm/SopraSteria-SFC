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
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Does your data meet funding requirements?');
    cy.get('[data-cy="cards-and-links"]').should('contain', 'See how you compare against other workplaces');
    cy.get('[data-cy="home-other-links"]').should('contain', 'View the ASC-WDS Benefits Bundle');
    cy.get('[data-cy="home-other-links"]').should('contain', 'Get your ASC-WDS certificate');
    cy.get('[data-cy="home-other-links"]').should('contain', 'About ASC-WDS');

    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Change data permissions');

    // waiting for permission fix to be available on test branch

    // cy.get('[data-cy="home-other-links"]').should('not.contain', 'Remove the link to your parent workplace');
  });
});
