/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';

describe('Training course for standalone workplace edit user', () => {
  const establishmentID = StandAloneEstablishment.id;
  const workerName = 'test worker for training course';

  before(() => {
    cy.deleteAllTrainingCourses(establishmentID);
    cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: 'Test training course' });
    cy.insertTestWorker({ establishmentID, workerName });
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));
  });

  // TODO: enable this test after the link to training course page is added to new button
  it.skip('should let user visit the training course main page from training and qualification tab', () => {
    onHomePage.clickTab('Training and qualifications');
    cy.get('button').contains('Add and manage training').click();
    cy.get('a').contains('Add and manager training courses').click();

    cy.get('h1').should('contain.text', 'Add and manage training courses for your workplace');
    cy.get('[data-testid="training-course-table"]')
      .as('training-course-table')
      .should('contain.text', 'Test training course');
  });
});
