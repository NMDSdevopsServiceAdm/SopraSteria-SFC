/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('Training and qualifications page', () => {
  const workerName = 'Test worker';

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName });
    cy.deleteTestWorkerFromDb(workerName);
    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName });
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
    cy.reload();
  });

  afterEach(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName });
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  describe('training record', () => {
    const trainingCategory = 'Health and safety awareness';
    const trainingName = 'Test Training';

    it('should add successfully', () => {
      cy.get('[data-testid="training-worker-table"]').contains(workerName).click();
      cy.contains('a', 'Add a record').click();

      // select type of record
      cy.getByLabel('Training record').click();
      cy.contains('button', 'Continue').click();

      // select training category
      cy.contains('button', 'Show all categories').click();
      cy.getByLabel(trainingCategory).click();
      cy.contains('button', 'Continue').click();

      // add training record details
      cy.get('[data-testid="trainingCategoryDisplay"]').contains(trainingCategory);
      cy.contains('a', 'Change');
      cy.getByLabel('Training name').clear().type(trainingName);
      cy.getByLabel('Yes').click();

      cy.get('[data-testid="completedDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2025);
      });

      cy.get('[data-testid="expiresDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2026);
      });

      cy.contains('button', 'Open notes').click();
      cy.get('[data-testid="notesSection"]').clear().type('Refresh');
      cy.contains('button', 'Save record').click();

      // staff training and qualifications page
      cy.get('[data-testid="generic_alert"]').contains('Training record added');
      cy.contains(trainingName);
    });

    it('should update successfully', () => {
      cy.addWorkerTraining({ establishmentID: StandAloneEstablishment.id, workerName, categoryId: 4 });
      cy.get('[data-testid="training-worker-table"]').contains(workerName).click();
      cy.contains('a', trainingName).click();

      // update training record details
      cy.getByLabel('No').click();

      cy.get('[data-testid="completedDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2025);
      });

      cy.get('[data-testid="expiresDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2026);
      });

      cy.contains('button', 'Save and return').click();

      // staff training and qualifications page
      cy.get('[data-testid="generic_alert"]').contains('Training record updated');
    });

    it('should delete successfully', () => {
      cy.addWorkerTraining({ establishmentID: StandAloneEstablishment.id, workerName, categoryId: 4 });
      cy.get('[data-testid="training-worker-table"]').contains(workerName).click();
      cy.contains('a', trainingName).click();

      // training record
      cy.contains('a', 'Delete this training record').click();

      // Confirm deletion
      cy.contains('button', 'Delete record').click();

      // staff training and qualifications page
      cy.get('[data-testid="generic_alert"]').contains('Training record deleted');
    })
  });
});
