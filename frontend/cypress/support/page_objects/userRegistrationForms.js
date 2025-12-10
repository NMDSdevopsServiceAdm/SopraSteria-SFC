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

export function createUserWithinWorkplace({ userFullName, username, password }) {
  cy.contains('a', 'Add a user').click();
  cy.get('h1').should('be.visible').and('contain.text', 'Add a user');

  cy.getByLabel('Full name').type(userFullName);
  cy.getByLabel('Job title ').type('Manager');
  cy.getByLabel('Email address').type('test@example.com');
  cy.getByLabel('Phone number').type('0123456789');

  cy.getByLabel('Edit').check();
  cy.get('button').contains('Save user').click();

  cy.get('a').contains('View users').click();

  cy.contains('a', userFullName);

  cy.get('a').contains('Sign out').click();

  cy.getNewUserUuidToken().then((uuidToken) => {
    const registrationUrl = `/activate-account/${uuidToken}/create-username`;
    cy.visit(registrationUrl);
  });

  fillUserRegistrationForm({ username: username, password: password });

  cy.get('h1').should('contain.text', 'Confirm your account details');
  cy.get('input#termsAndConditions').check();

  cy.get('button').contains('Submit details').click();

  cy.get('span').contains('Your account is now active').should('be.visible');
}
