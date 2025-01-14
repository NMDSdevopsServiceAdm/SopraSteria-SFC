/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as edit user where parent owns the data', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUserNonDataOwner'), Cypress.env('userPassword'));
  });

  it('should see the admin page', () => {
    cy.contains('Aster House');
    cy.contains('Workplace test 1');
  });

  it('should show all tabs when sub has view workplace and staff records permissions', () => {
    onHomePage.allTabs();
  });

  it('should show check your WDF data link', () => {
    cy.get('[data-cy="main-home-links"]').should('contain', 'Check your WDF data');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="main-home-links"]').should('not.contain', 'Bulk upload your data');
  });

  it('should show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Remove link to my parent organisation');
  });

  it('should not show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Set data permissions');
  });
});
