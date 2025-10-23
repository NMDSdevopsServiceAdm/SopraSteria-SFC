/* eslint-disable no-undef */
/// <reference types="cypress" />

import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('page after login', () => {
  const fullUserName = StandAloneEstablishment.editUserLoginName;
  const editUserId = StandAloneEstablishment.editUserId;
  const establishmentID = StandAloneEstablishment.id;

  const setUpUserAttributes = (property, value) => {
    cy.updateUserFieldForLoginTests(fullUserName, property, value);
    cy.reload();
    cy.loginAsUserForInterstitialPages(fullUserName, Cypress.env('userPassword'));
  };

  beforeEach(() => {
    cy.revertUserAttributes(fullUserName, editUserId);
    cy.updateEmployerTypeValue(establishmentID, 'Other');
  });

  after(() => {
    cy.revertUserAttributes(fullUserName, editUserId);
    cy.updateEmployerTypeValue(establishmentID, 'Other');
  });

  it('should go straight to the dashboard', () => {
    cy.loginAsUser(fullUserName, Cypress.env('userPassword'));

    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard#home');
    cy.contains(StandAloneEstablishment.name);
  });

  it('should go to the new training courses page', () => {
    setUpUserAttributes('TrainingCoursesMessageViewedQuantity', 0);
    cy.url().should('eq', Cypress.config().baseUrl + '/new-training-courses');
    cy.get('h1').should('contain', "What's new in ASC-WDS?");

    cy.get('a').contains('Close this page').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard#home');
  });

  describe('registration survery', () => {
    beforeEach(() => {
      setUpUserAttributes('RegistrationSurveyCompleted', false);
    });

    it('should go through the registration survery questions', () => {
      cy.contains(StandAloneEstablishment.name);
      cy.get('h1').should('contain', 'Welcome to your new account');

      cy.getByLabel("Yes, I'll answer the questions").click();
      cy.get('button').contains('Continue').click();

      // question 1
      cy.get('h1').should('contain', 'Why did you create an account?');
      cy.getByLabel('To get access to funding').click();
      cy.getByLabel('To record and manage staff training and qualifications').click();
      cy.get('button').contains('Next question').click();

      // question 2
      cy.get('h1').should('contain', 'How did you hear about the Adult Social Care Workforce Data Set service?');
      cy.getByLabel('From the Skills for Care website').click();
      cy.getByLabel('From our local authority').click();
      cy.get('button').contains('Finish').click();

      cy.get('h1').should('contain', 'Thank you, we really appreciate your help');
      cy.get('a').contains('Continue').click();

      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
    });

    it('should go to home page after the registration survery page', () => {
      cy.contains(StandAloneEstablishment.name);
      cy.get('h1').should('contain', 'Welcome to your new account');

      cy.getByLabel('No, I want to start adding data').click();
      cy.get('button').contains('Continue').click();

      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
    });
  });

  it('should go to the type-of-employer page', () => {
    cy.updateEmployerTypeValue(establishmentID, null);
    cy.reload();
    cy.loginAsUser(fullUserName, Cypress.env('userPassword'));

    cy.url().should('include', '/type-of-employer');
    cy.get('h1').should('contain', 'What type of employer are you?');

    cy.getByLabel('Other').click();
    cy.get('button').contains('Continue to homepage').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
  });

  it('should go to the update your vacancies and turnover data page', () => {
    setUpUserAttributes('LastViewedVacanciesAndTurnoverMessage', null);
    cy.url().should('eq', Cypress.config().baseUrl + '/update-your-vacancies-and-turnover-data');
    cy.get('h1').should('contain', 'Your Workplace vacancies and turnover information');

    cy.get('a').contains('Continue').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
  });
});
