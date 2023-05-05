/* eslint-disable no-undef */
/// <reference types="cypress" />

// waiting for permission fix to be available on test branch
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as read only user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlySubUserNonDataOwner'), Cypress.env('userPassword'));
  });

  it('should see the admin page', () => {
    cy.contains('Aster House');
    cy.contains('Workplace test 1');
  });

  // waiting for permission fix to be available on test branch
  it('should show all tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should show check your WDF data link', () => {
    cy.get('[data-cy="main-home-links"]').should('contain', 'Check your WDF data');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="main-home-links"]').should('not.contain', 'Bulk upload your data');
  });

  // waiting for permission fix to be available on test branch
  // it('should not show remove link to parent organisation', () => {
  //   cy.get('[data-cy="home-other-links"]').should('not.contain', 'Remove link to my parent organisation');
  // });

  it('should not show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Set data permissions');
  });
});
