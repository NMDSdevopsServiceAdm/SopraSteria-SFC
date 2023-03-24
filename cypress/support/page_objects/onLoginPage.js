/* eslint-disable no-undef */
/// <reference types="cypress" />

export class LoginPage {
  submitFormWithUsernameAndPassword(username, password) {
    cy.get('[data-cy="username"]').type(username);
    cy.get('[data-cy="password"]').type(password);
    this.clickSubmitButton();
  }

  clickSubmitButton() {
    cy.get('[data-testid="signinButton"]').click();
  }

  submitFormWithNoUsername(password) {
    cy.get('[data-cy="password"]').type(password);
    this.clickSubmitButton();
  }

  submitFormWithNoPassword(username) {
    cy.get('[data-cy="username"]').type(username);
    this.clickSubmitButton();
  }

  showsErrorSummary(errorMessage, additionalErrorMessage = null) {
    cy.get('[data-cy="error-summary"]').should('be.visible');
    cy.get('[data-cy="error-summary"]').contains(errorMessage);
    additionalErrorMessage && cy.get('[data-cy="error-summary"]').contains(additionalErrorMessage);
  }

  clickErrorLinkSetsFocus(errorMessage) {
    cy.get('[data-cy="error-summary"]').contains(errorMessage).click();
  }
}

export const onLoginPage = new LoginPage();
