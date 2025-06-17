/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onTrainingAndQualsPage } from '../../support/page_objects/onTrainingAndQualsPage';

describe('Standalone training and qualifications page as edit user', () => {
  beforeEach(() => {
    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: 'Cypress test worker' });

    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
    cy.reload();
  });

  after(() => {
    cy.deleteTestWorkerFromDb('Cypress test worker');
  });

  it('should see the standalone establishment training and quals page', () => {
    cy.url().should('include', '#training-and-qualifications');
    cy.get('[data-cy="add-multiple-training-records-button"]').should('contain', 'Add multiple training records');
    cy.get('[data-testid="standAloneDashboard"]').contains('Training and qualifications');
  });

  it('should show all sections', () => {
    onTrainingAndQualsPage.sectionsAreVisible();
  });
});
