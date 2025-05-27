/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Help pages', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
  });

  it('should navigate to the Get Started page after clicking the Get Help button', () => {
    cy.contains('button', 'Get help').click();
    cy.url().should('include', '/help/get-started');
    cy.contains('h1', 'Get help and tips').should('be.visible');
    cy.contains('h1', 'Get started').should('be.visible');
  });

  const helpPages = [
    { name: 'Helpful downloads', path: '/help/helpful-downloads' },
    { name: "What's new", path: '/help/whats-new' },
    { name: 'Questions and answers', path: '/help/questions-and-answers' },
    { name: 'Contact us', path: '/help/contact' },
  ];

  helpPages.forEach(({ name, path }) => {
    it(`should navigate to the ${name} page from the help navbar`, () => {
      cy.visit('/help/get-started');
      cy.contains('nav a', name).click();
      cy.url().should('include', path);
      cy.contains('h1', name).should('be.visible');
    });
  });
});
