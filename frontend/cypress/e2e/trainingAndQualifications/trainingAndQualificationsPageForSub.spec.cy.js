/* eslint-disable no-undef */
/// <reference types="cypress" />

const { SubEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('Sub training and quals page as edit user', () => {
  const workerName = 'test worker for training & quals';
  const establishmentID = SubEstablishment.id;

  before(() => {
    cy.insertTestWorker({ establishmentID, workerName });
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should show the training and qualifications page', () => {
    cy.get('[data-cy="add-multiple-training-records-button"]').should('contain', 'Add multiple training records');
    cy.get('[data-testid="trainingLinkPanel"]').should('exist');
    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
  });
});
