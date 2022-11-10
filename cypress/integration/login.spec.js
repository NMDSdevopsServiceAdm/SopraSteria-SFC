/// <reference types="cypress" />

/* eslint-disable no-undef */
describe('As an admin I want to login', () => {
  before(() => {
    // to allow page to load after saving
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should show the landing page', () => {
    cy.get('[data-cy="signin-heading"]').should('contain', 'Sign in');
  });

  it('should login to admin section when given admin username and password', () => {
    cy.get('[data-cy="username"]').type('greenj');
    cy.get('[data-cy="password"]').type('Password00');
    cy.get('[data-testid="signinButton"]').click();
    cy.get('[data-cy="admin-heading"]').should('contain', 'Admin');
  });

  it('should show an error summary box and error on username input when username is not provided', () => {
    cy.get('[data-cy="password"]').type('Password00');
    cy.get('[data-testid="signinButton"]').click();
    cy.get('[data-cy="username-error"]').should('contain', 'Enter your username');
    cy.get('[data-cy="error-summary"]').should('be.visible');
    cy.get('[data-cy="error-0"]').should('contain', 'Enter your username');
  });

  it('should focus move focus to username field when no username is provided and the error in the summary box is clicked', () => {
    cy.get('[data-cy="password"]').type('Password00');
    cy.get('[data-testid="signinButton"]').click();
    cy.get('[data-cy="error-0"]').click();
    cy.get('[data-cy="username"]').should('be.focused');
  });

  it('should show an error summary box and error on password input when password is not provided', () => {
    cy.get('[data-cy="username"]').type('greenj');
    cy.get('[data-testid="signinButton"]').click();
    cy.get('[data-cy="password-error"]').should('contain', 'Enter your password');
    cy.get('[data-cy="error-summary"]').should('be.visible');
    cy.get('[data-cy="error-0"]').should('contain', 'Enter your password');
  });

  it('should focus move focus to username field when no username is provided and the error in the summary box is clicked', () => {
    cy.get('[data-cy="username"]').type('greenj');
    cy.get('[data-testid="signinButton"]').click();
    cy.get('[data-cy="error-0"]').click();
    cy.get('[data-cy="password"]').should('be.focused');
  });

  it('should show an error summary box and errors on both inputs when the username and password are not provided', () => {
    cy.get('[data-testid="signinButton"]').click();
    cy.get('[data-cy="username-error"]').should('contain', 'Enter your username');
    cy.get('[data-cy="password-error"]').should('contain', 'Enter your password');
    cy.get('[data-cy="error-summary"]').should('be.visible');
    cy.get('[data-cy="error-0"]').should('contain', 'Enter your username');
    cy.get('[data-cy="error-1"]').should('contain', 'Enter your password');
  });
});
