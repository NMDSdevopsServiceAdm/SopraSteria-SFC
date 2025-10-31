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

// describe('Training course for standalone workplace edit user', () => {
//   const establishmentID = StandAloneEstablishment.id;

//   before(() => {
//     cy.deleteAllTrainingCourses(establishmentID);
//     cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: 'Test training course' });
//     cy.insertTestWorker({ establishmentID, workerName });
//   });

//   after(() => {
//     cy.deleteTestWorkerFromDb(workerName);
//     cy.deleteAllTrainingCourses(establishmentID);
//   });

//   beforeEach(() => {
//     cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));
//   });

//   it('should let user visit the training course main page from training and qualification tab', () => {
//     onHomePage.clickTab('Training and qualifications');
//     cy.contains('Add and manage training').click();
//     cy.get('a').contains('Add and manage training courses').click();

//     cy.get('h1').should('contain.text', 'Add and manage training courses for your workplace');
//     cy.get('[data-testid="training-course-table"]')
//       .as('training-course-table')
//       .should('contain.text', 'Test training course');
//   });

//   it('should allow user add a new training course', () => {
//     onHomePage.clickTab('Training and qualifications');
//     cy.contains('Add and manage training').click();
//     cy.get('a').contains('Add and manage training courses').click();

//     cy.get('a').contains('Add a training course').click();

//     cy.get('h1').should('contain', 'Add training course details');
//     cy.getByLabel('Training course name').type('Test add new training course');
//     cy.getByLabel('Yes').click();
//     cy.getByLabel('External provider').click();
//     cy.getByLabel('Provider name').type('Care skill academy');
//     cy.getByLabel('Face to face').click();
//     cy.getByLabel('This training does not expire').click();

//     cy.get('button').contains('Continue').click();

//     cy.get('h1').should('contain', 'Select a category that best matches this training course');

//     cy.contains('Show all categories').click();
//     cy.getByLabel('Medication management').click();
//     cy.get('button').contains('Save training course').click();

//     cy.get('h1').should('contain', 'Add and manage training courses');
//     cy.get('app-alert span').should('contain', 'Training course added');

//     cy.get('[data-testid="training-course-table"]').should('contain.text', 'Test add new training course');
//   });
// });
