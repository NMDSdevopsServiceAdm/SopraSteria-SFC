const { StandAloneEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('change password for a user', { tags: '@registration' }, () => {
  const mockUserFullName = 'Mock new user for password change';
  const mockUsername = 'mock-new-user-chgpwd';

  const oldPassword = Cypress.env('userPassword');
  const mockNewPassword = 'Mock-new-password00!';

  before(() => {
    cy.deleteTestUserFromDb(mockUserFullName);
    cy.addTestUser(mockUserFullName, mockUsername, StandAloneEstablishment.id);
  });

  beforeEach(() => {
    cy.loginAsUser(mockUsername, Cypress.env('userPassword'));
  });

  it(`should allow user to change their password`, () => {
    const mockUserFirstName = mockUserFullName.split(' ').at(0);
    cy.contains(mockUserFirstName).click();

    cy.url().should('contain', '/account-management');
    cy.get('h1').should('contain', 'My account details');

    cy.contains('.govuk-summary-list', 'Password').within(() => {
      cy.contains('a', 'Change').click();
    });

    cy.url().should('contain', '/account-management/change-password');

    cy.getByLabel('Old password').type(oldPassword);
    cy.getByLabel('New password').type(mockNewPassword);
    cy.getByLabel('Confirm new password').type(mockNewPassword);

    cy.contains('button', 'Save and return').click();

    cy.url().should('contain', 'password-saved');
    cy.get('h1').should('contain', 'Your new password has been saved');

    cy.contains('button', 'Back to sign in').click();

    cy.url().should('contain', '/login');

    // verify password is changed
    cy.getByLabel('Username').type(mockUsername);
    cy.getByLabel('Password').type(oldPassword);
    cy.contains('button', 'Sign in').click();

    cy.contains('There is a problem').should('be.visible');
    cy.contains('Your username or your password is incorrect').should('be.visible');

    cy.getByLabel('Password').clear();
    cy.getByLabel('Password').type(mockNewPassword);
    cy.contains('button', 'Sign in').click();

    onHomePage.clickTab('Workplace');
    cy.url().should('contain', 'dashboard#workplace');
    cy.contains(`Workplace ID: ${StandAloneEstablishment.nmdsId}`).should('be.visible');
  });
});
