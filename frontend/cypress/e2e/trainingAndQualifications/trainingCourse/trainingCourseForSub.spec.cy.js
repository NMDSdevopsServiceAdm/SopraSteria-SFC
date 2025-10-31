/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../../support/mockEstablishmentData';
import { runTestsForTrainingCourseJourney } from './runTestsForTrainingCourse';

describe('Training course for subsidiary workplace edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, Cypress.env('userPassword'));
  });

  runTestsForTrainingCourseJourney(SubEstablishment);
});
