/* eslint-disable no-undef */
/// <reference types="cypress" />

const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('Sub training and quals page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should show the training and qualifications page', () => {
    cy.get('[data-cy="add-multiple-training-records-button"]').should('contain', 'Add multiple training records');
    cy.get('[data-testid="trainingLinkPanel"]').should('exist');
    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
  });
});
