/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../../support/mockEstablishmentData';
import { runTestsForTrainingCourseJourney } from './runTestsForTrainingCourse';

describe('Training course for subsidiary workplace edit user', () => {
  const testEstablishment = SubEstablishment;

  beforeEach(() => {
    cy.loginAsUser(testEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.url().should('contain', 'dashboard#home');
    cy.get('h1').should('contain', testEstablishment.name);
  });

  runTestsForTrainingCourseJourney(testEstablishment);
});
