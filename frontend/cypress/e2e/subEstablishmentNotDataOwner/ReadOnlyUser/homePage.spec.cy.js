/* eslint-disable no-undef */
/// <reference types="cypress" />

import { SubEstablishmentNotDataOwner } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as read only user', { tags: '@home' }, () => {
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

  it('should show funding link', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Does your data meet funding requirements?');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
  });

  // waiting for permission fix to be available on test branch
  // it('should not show remove link to parent organisation', () => {
  //   cy.get('[data-cy="home-other-links"]').should('not.contain', 'Remove the link to your parent workplace');
  // });

  it('should not show change data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Change data permissions');
  });
});
