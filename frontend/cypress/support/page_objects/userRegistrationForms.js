/// <reference types="cypress" />

export function fillUserRegistrationForm({ username, password }) {
  cy.get('h1').should('contain.text', 'Create your username and password');

  cy.getByLabel('Username').type(username);
  cy.getByLabel('Password').type(password);
  cy.getByLabel('Confirm password').type(password);
  cy.get('button').contains('Continue').click();

  cy.get('h1').should('contain.text', 'Create and answer your security question');

  cy.getByLabel('Security question').type('What is the colour of a green orange?');
  cy.getByLabel('Answer').type('green');
  cy.get('button').contains('Continue').click();
}
