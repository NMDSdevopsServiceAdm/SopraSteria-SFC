/* eslint-disable no-undef */
/// <reference types="cypress" />

const { onHomePage } = require("../../../support/page_objects/onHomePage");

describe('Sub training and quals page as edit user where parent owns the data', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUserNonDataOwner'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should show the training and qualifications page', () => {
    cy.get('[data-cy="total-training-panel"]').should('exist');
    cy.get('[data-cy="training-summary"]').should('exist');
  });
});
