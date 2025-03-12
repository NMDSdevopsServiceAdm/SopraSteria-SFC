/// <reference types="cypress" />
import { fillUserRegistrationForm } from './fillUserRegistrationForm';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('As a workplace primary user I want to register a new user', () => {
  const userFullName = 'Test new user for cypress';
  const loginId = 'cypress-test-user-0002';
  const mockPassword = 'Some-very-super-strong-p@ssw0rd';

  before(() => {
    cy.wait(2000);
    cy.deleteTestUserFromDb(userFullName);
  });

  after(() => {
    cy.deleteTestUserFromDb(userFullName);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

    // get pass the vacancies and turnover login message if necessary
    cy.get('h1').should('not.contain', 'Sign in');
    cy.get('h1')
      .invoke('text')
      .then((headingText) => {
        if (headingText.includes('Your Workplace vacancies and turnover information')) {
          cy.get('a').contains('Continue').click();
        }
      });
  });

  it('should be able to create a new user for the workplace', () => {
    // Add new user to workplace
    cy.contains('a', 'Users').click();
    cy.contains('a', 'Add a user').click();
    cy.get('h1').should('be.visible').and('contain.text', 'Add a user');

    cy.getByLabel('Full name').type(userFullName);
    cy.getByLabel('Job title ').type('Manager');
    cy.getByLabel('Email address').type('test@example.com');
    cy.getByLabel('Phone number').type('0123456789');

    cy.getByLabel('Read').check();
    cy.get('button').contains('Save user').click();
    cy.get('a').contains('Sign out').click();

    cy.get('a').contains('Sign in').should('be.visible');

    // register username and password
    cy.getNewUserUuidToken().then((uuidToken) => {
      const registrationUrl = `/activate-account/${uuidToken}/create-username`;
      cy.visit(registrationUrl);
    });

    fillUserRegistrationForm({ username: loginId, password: mockPassword });

    cy.get('h1').should('contain.text', 'Confirm your account details');
    cy.get('input#termsAndConditions').check();

    cy.get('button').contains('Submit details').click();

    cy.get('span').contains('Your account is now active').should('be.visible');

    // try login as the new user
    cy.loginAsUser(loginId, mockPassword);
    cy.get('h1').contains('df').should('be.visible');
    onHomePage.allTabs('read');
  });
});
