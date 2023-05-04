/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Standalone home page as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
  });

  // placeholder test to make sure the login function is working
  it('should see the admin page', () => {
    cy.contains('df');
  });

  it('should show all tabs', () => {
    onHomePage.allTabs();
  });

  it('should show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Bulk upload your data');
  });

  it('should show WDF requirements link', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Does your data meet WDF requirements?');
  });

  it('should show parent organisation links', () => {
    cy.get('[data-cy="home-other-links"]').should('contain', 'Link to my parent organisation');
    cy.get('[data-cy="home-other-links"]').should('contain', 'Become a parent organisation');
  });
});
