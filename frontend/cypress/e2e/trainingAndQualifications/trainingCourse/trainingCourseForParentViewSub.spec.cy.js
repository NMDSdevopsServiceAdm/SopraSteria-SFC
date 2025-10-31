/// <reference types="cypress" />
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../../support/mockEstablishmentData';
import { runTestsForTrainingCourseJourney } from './runTestsForTrainingCourse';

describe('Training course for parent workplace edit user', () => {
  const subsidaryToView = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidaryToView.name);

    cy.url().should('contain', 'dashboard#home');
    cy.get('h1').should('contain', subsidaryToView.name);
  });

  runTestsForTrainingCourseJourney(subsidaryToView);
});
