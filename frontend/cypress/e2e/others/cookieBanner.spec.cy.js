/* eslint-disable no-undef */
/// <reference types="cypress" />

import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('Cookie banner', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearAllCookies();
    cy.reload();
  });

  it('should show a cookie banner', () => {
    cy.get('[data-testid="cookie-banner"]').should('exist');

    cy.get('[data-testid="cookie-banner"]').within(() => {
      cy.get('div').contains('Cookies on the Adult Social Care Workforce Data Set').should('be.visible');
      cy.get('button').contains('Accept analytics cookies').should('be.visible');
      cy.get('button').contains('Reject analytics cookies').should('be.visible');
      cy.get('a').contains('View cookies').should('be.visible');
    });
  });

  ['Accept', 'Reject'].forEach((buttonName) => {
    it(`should close the cookie banner when ${buttonName} button is clicked`, () => {
      cy.get('[data-testid="cookie-banner"]').should('exist');

      cy.get('button').contains(`${buttonName} analytics cookies`).click();

      cy.get('[data-testid="cookie-banner"]').should('not.exist');
    });
  });

  it('after closing the cookie banner, it should remain closed between logins and page reloads', () => {
    cy.get('[data-testid="cookie-banner"]').should('exist');

    cy.get('button').contains('Reject analytics cookies').click();
    cy.get('[data-testid="cookie-banner"]').should('not.exist');

    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));
    cy.get('[data-testid="cookie-banner"]').should('not.exist');

    cy.get('a').contains('Sign out').click();
    cy.get('[data-testid="cookie-banner"]').should('not.exist');

    cy.visit('/');
    cy.reload();
    cy.get('[data-testid="cookie-banner"]').should('not.exist');
  });

  it('should not show the cookie banner on the cookie policy page', () => {
    cy.get('a').contains('View cookies').click();
    cy.get('h1').should('contain', 'Cookie policy');

    cy.get('[data-testid="cookie-banner"]').should('not.exist');
  });
});
