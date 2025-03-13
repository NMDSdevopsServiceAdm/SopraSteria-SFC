/// <reference types="cypress" />
import { fillUserRegistrationForm } from './fillUserRegistrationForm';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { StandAloneEstablishment } from '../../support/establishmentData';

describe('As a workplace primary user I want to register a new user', () => {
  const userFullName = 'Test new user for cypress';
  const loginId = 'cypress-test-user-0002';
  const mockPassword = 'Some-very-super-strong-p@ssw0rd';

  before(() => {
    cy.wait(2000);
    cy.deleteTestUserFromDb(userFullName);
  });

  const getPassVacanciesAndTurnoverLoginMessage = () => {
    cy.get('h1').should('not.contain', 'Sign in');
    cy.get('h1')
      .invoke('text')
      .then((headingText) => {
        if (headingText.includes('Your Workplace vacancies and turnover information')) {
          cy.get('a').contains('Continue').click();
        }
      });
  };

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    getPassVacanciesAndTurnoverLoginMessage();
  });

  afterEach(() => {
    cy.deleteTestUserFromDb(userFullName);
  });

  const userTypes = ['edit', 'read'];

  userTypes.forEach((userType) => {
    it(`should be able to add a new ${userType} user for the workplace`, () => {
      // Add new user to workplace
      cy.contains('a', 'Users').click();
      cy.contains('a', 'Add a user').click();
      cy.get('h1').should('be.visible').and('contain.text', 'Add a user');

      cy.getByLabel('Full name').type(userFullName);
      cy.getByLabel('Job title ').type('Manager');
      cy.getByLabel('Email address').type('test@example.com');
      cy.getByLabel('Phone number').type('0123456789');

      const checkboxLabelForUserType = userType[0].toUpperCase() + userType.slice(1);
      cy.getByLabel(checkboxLabelForUserType).check();
      cy.get('button').contains('Save user').click();
      cy.get('a').contains('Sign out').click();

      cy.get('a').contains('Sign in').should('be.visible');

      // mimic visiting the registration link from email
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
      if (userType === 'edit') {
        getPassVacanciesAndTurnoverLoginMessage();
      }

      cy.get('h1').contains(StandAloneEstablishment.name).should('be.visible');
      onHomePage.allTabs(userType);
    });
  });
});
