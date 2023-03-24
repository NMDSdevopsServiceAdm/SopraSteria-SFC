/// <reference types="cypress" />
import { onLoginPage } from '../../support/page_objects/onLoginPage';

/* eslint-disable no-undef */
describe('As an admin I want to login', () => {
  before(() => {
    // to allow page to load after saving
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.openLoginPage();
  });

  it('should show the landing page', () => {
    cy.get('[data-cy="signin-heading"]').should('contain', 'Sign in');
  });

  it('should login to admin section when given admin username and password', () => {
    onLoginPage.submitFormWithUsernameAndPassword(Cypress.env('adminUser'), Cypress.env('adminPassword'));
    cy.get('[data-cy="admin-heading"]').should('contain', 'Admin');
  });

  it('should show an error summary box and error on username input when username is not provided', () => {
    onLoginPage.submitFormWithNoUsername(Cypress.env('adminPassword'));
    onLoginPage.showsErrorSummary('Enter your username');
    cy.get('[data-cy="username-error"]').should('contain', 'Enter your username');
  });

  it('should move focus to username input when no username is provided and the error in the summary box is clicked', () => {
    onLoginPage.submitFormWithNoUsername(Cypress.env('adminPassword'));
    onLoginPage.clickErrorLinkSetsFocus('Enter your username');
    cy.get('[data-cy="username"]').should('be.focused');
  });

  it('should show an error summary box and error on password input when password is not provided', () => {
    onLoginPage.submitFormWithNoPassword(Cypress.env('adminUser'));
    onLoginPage.showsErrorSummary('Enter your password');
    cy.get('[data-cy="password-error"]').should('contain', 'Enter your password');
  });

  it('should move focus to password input when no password is provided and the error in the summary box is clicked', () => {
    onLoginPage.submitFormWithNoPassword(Cypress.env('adminUser'));
    onLoginPage.clickErrorLinkSetsFocus('Enter your password');
    cy.get('[data-cy="password"]').should('be.focused');
  });

  it('should show an error summary box and errors on both inputs when the username and password are not provided', () => {
    onLoginPage.clickSubmitButton();
    onLoginPage.showsErrorSummary('Enter your username', 'Enter your password');
    cy.get('[data-cy="username-error"]').should('contain', 'Enter your username');
    cy.get('[data-cy="password-error"]').should('contain', 'Enter your password');
  });

  it('should show an error summary box and errors if and invalid username is provided', () => {
    onLoginPage.submitFormWithUsernameAndPassword('invalidUsername', Cypress.env('adminPassword'));
    onLoginPage.showsErrorSummary('Your username or your password is incorrect');
  });

  it('should show an error summary box and errors if and invalid password is provided', () => {
    onLoginPage.submitFormWithUsernameAndPassword(Cypress.env('adminUser'), 'invalidPassword');
    onLoginPage.showsErrorSummary('Your username or your password is incorrect');
  });
});
