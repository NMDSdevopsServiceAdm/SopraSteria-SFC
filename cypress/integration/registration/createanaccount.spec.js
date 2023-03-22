/// <reference types="cypress" />

xdescribe('Create account', () => {
  before(() => {
    // to allow page to load after saving
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should show the create acount start page', () => {
    cy.contains('Create an account').click({ force: true });
    cy.location('pathname').should('eq', '/registration/create-account');
    cy.get('[data-cy="account-heading"]').should('contain', 'Create an Adult Social Care Workforce Data Set account');
    cy.contains('Start now').click({ force: true });
    cy.location('pathname').should('eq', '/registration/regulated-by-cqc');
    cy.get('[data-cy="cqc-heading"]').should(
      'contain',
      'Is the main service you provide regulated by the Care Quality Commission?',
    );
    cy.go('back').then(() => {
      cy.contains('Start now').click({ force: true });

      cy.location('pathname').should('eq', '/registration/regulated-by-cqc');
    });

    cy.get('[data-testid="continueButton"]').click();
    cy.get('[data-cy="cqc-error"]').should(
      'contain',
      'Select yes if the main service you provide is regulated by the Care Quality Commission',
    );
    cy.get('[data-cy="error-summary"]').should('be.visible');
    cy.get('[data-cy="error-0"]').should(
      'contain',
      'Select yes if the main service you provide is regulated by the Care Quality Commission',
    );
    cy.get('#regulatedByCQC-1').check();
  });
});

/// <reference types="cypress" />

/* eslint-disable no-undef */
xdescribe('Create an account', () => {
  before(() => {
    // to allow page to load after saving
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should show a create account link on the landing page', () => {
    cy.get('[data-cy="create-account"]').should('contain', 'Create an account');
  });

  it('should');
});
