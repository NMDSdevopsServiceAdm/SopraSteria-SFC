/* eslint-disable no-undef */
/// <reference types="cypress" />

const { ParentEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('Parent training and quals page as edit user', () => {
  const workerName = 'test worker for training & quals';
  const establishmentID = ParentEstablishment.id;

  before(() => {
    cy.insertTestWorker({ establishmentID, workerName });
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should show the training and qualifications page', () => {
    cy.get('[data-cy="add-multiple-training-records-button"]').should('contain', 'Add multiple training records');
    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
  });
});
