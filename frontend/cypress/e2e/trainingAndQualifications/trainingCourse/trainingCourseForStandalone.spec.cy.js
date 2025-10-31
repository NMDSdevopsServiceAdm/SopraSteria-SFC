/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { runTestsForTrainingCourseJourney } from './runTestsForTrainingCourse';

describe('Training course for standalone workplace edit user', () => {
  const testEstablishment = StandAloneEstablishment;

  beforeEach(() => {
    cy.loginAsUser(testEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.url().should('contain', 'dashboard#home');
    cy.get('h1').should('contain', testEstablishment.name);
  });

  runTestsForTrainingCourseJourney(testEstablishment);
});
