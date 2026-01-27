/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment } from '../../../support/mockEstablishmentData';
import { runTestsForTrainingCourseJourney } from './runTestsForTrainingCourse';
import { runTestsForUpdateTrainingRecordsWithCourseDetails } from './runTestsForUpdateRecordsWithTrainingCourseDetails';

describe('Training course for parent workplace edit user', { tags: '@trainingCourses' }, () => {
  const testEstablishment = ParentEstablishment;

  beforeEach(() => {
    cy.loginAsUser(testEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', testEstablishment.name);
  });

  runTestsForTrainingCourseJourney(testEstablishment);

  runTestsForUpdateTrainingRecordsWithCourseDetails(testEstablishment);
});
