const { StandAloneEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('change password for a user', { tags: '@registration' }, () => {
  const userRoleTypes = ['Read', 'Edit', 'Admin', 'AdminManager'];
  const mockUsernamePrefix = 'mock-new-user-chgpwd';

  const mockUsers = userRoleTypes.map((role) => ({
    fullname: `Mock new user ${role}`,
    username: `${mockUsernamePrefix}-${role.toLowerCase()}`,
    role,
  }));

  const oldPassword = Cypress.env('userPassword');
  const mockNewPassword = 'Mock-new-password00!';

  before(() => {
    cy.deleteTestUserFromDb('Mock changed name');
    mockUsers.forEach((mockUser) => {
      cy.deleteTestUserFromDb(mockUser.fullname);
      cy.addTestUser(mockUser.fullname, mockUser.username, StandAloneEstablishment.id, mockUser.role);
    });
  });

  mockUsers.forEach((mockUser) => {
    const { fullname, username, role } = mockUser;
    describe(`for user role type: ${role}`, () => {
      beforeEach(() => {
        cy.loginAsUser(username, Cypress.env('userPassword'));
      });

      it('should allow user to change their user details', () => {
        const mockUserFirstName = fullname.split(' ').at(0);
        cy.contains(mockUserFirstName).click();

        cy.url().should('contain', '/account-management');
        cy.get('h1').should('contain', 'My account details');

        cy.contains('.govuk-summary-list', 'Full name').within(() => {
          cy.contains('a', 'Change').click();
        });

        cy.url().should('contain', '/account-management/change-your-details');

        cy.getByLabel('Full name').clear();
        cy.getByLabel('Full name').type('Mock changed name');

        cy.getByLabel('Job title').clear();
        cy.getByLabel('Job title').type('Updated job title');

        cy.getByLabel('Email address').clear();
        cy.getByLabel('Email address').type('changed.email@example.com');

        cy.getByLabel('Phone number').clear();
        cy.getByLabel('Phone number').type('9876543210');

        cy.contains('button', 'Save and return').click();

        cy.url().should('contain', '/account-management');
        cy.get('h1').should('contain', 'My account details');

        // verify user details are changed
        expectRow('Full name').toHaveValue('Mock changed name');
        expectRow('Job title').toHaveValue('Updated job title');
        expectRow('Email address').toHaveValue('changed.email@example.com');
        expectRow('Phone number').toHaveValue('9876543210');
      });

      it(`should allow user to change their password`, () => {
        const mockUserFirstName = fullname.split(' ').at(0);
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
        cy.getByLabel('Username').type(username);
        cy.getByLabel('Password').type(oldPassword);
        cy.contains('button', 'Sign in').click();

        cy.contains('There is a problem').should('be.visible');
        cy.contains('Your username or your password is incorrect').should('be.visible');

        cy.getByLabel('Password').clear();
        cy.getByLabel('Password').type(mockNewPassword);
        cy.contains('button', 'Sign in').click();

        if (['Read', 'Edit'].includes(role)) {
          onHomePage.clickTab('Workplace');
          cy.url().should('contain', 'dashboard#workplace');
          cy.contains(`Workplace ID: ${StandAloneEstablishment.nmdsId}`).should('be.visible');
        } else {
          cy.get('h1').should('contain.text', 'Admin');
        }
      });
    });
  });

  const expectRow = (rowKey) => {
    const toHaveValue = (expectedValue) => {
      cy.contains('.govuk-summary-list__key', rowKey)
        .siblings('.govuk-summary-list__value')
        .should('contain.text', expectedValue);
    };

    return { toHaveValue };
  };
});
