/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('training record', () => {
  const workerName1 = 'Test worker';
  const workerName2 = 'Test worker 2';
  const trainingCategory = 'Health and safety awareness';
  const trainingName = 'Test Training';

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName1 });
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName2 });

    cy.deleteTestWorkerFromDb(workerName1);
    cy.deleteTestWorkerFromDb(workerName2);

    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: workerName1 });
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
    cy.reload();
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName1);
    cy.deleteTestWorkerFromDb(workerName2);
  });

  afterEach(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName1 });
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName2 });
  });

  it('should add successfully', () => {
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
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
    cy.addWorkerTraining({ establishmentID: StandAloneEstablishment.id, workerName: workerName1, categoryId: 4 });
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
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
    cy.addWorkerTraining({ establishmentID: StandAloneEstablishment.id, workerName: workerName1, categoryId: 4 });
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
    cy.contains('a', trainingName).click();

    // training record
    cy.contains('a', 'Delete this training record').click();

    // Confirm deletion
    cy.contains('button', 'Delete record').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('Training record deleted');
  });

  it('should add multiple training records successfully', () => {
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName2 });
    cy.deleteTestWorkerFromDb(workerName2);
    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: workerName2 });

    cy.contains('button', 'Add and manage training').click();
    cy.contains('a', 'Add multiple training records').click();

    // select staff
    cy.contains('Select all those who you want to add a record for');
    cy.get('[class="govuk-summary-list__row"]').contains(workerName1).as('selectedWorker1');
    cy.get('@selectedWorker1').siblings().contains('a', 'Select').click();
    cy.get('@selectedWorker1').siblings().contains('Deselect');

    cy.get('[class="govuk-summary-list__row"]').contains(workerName2).as('selectedWorker2');
    cy.get('@selectedWorker2').siblings().contains('a', 'Select').click();
    cy.get('@selectedWorker2').siblings().contains('Deselect');

    cy.get('[class="asc-records-count"]').contains('2');

    cy.contains('button', 'Continue').click();

    // select training category
    cy.contains('button', 'Show all categories').click();
    cy.getByLabel(trainingCategory).click();
    cy.contains('button', 'Continue').click();

    // add training record details
    cy.get('[data-testid="numberOfStaffSelected"]').as('numberOfStaffSelected');
    cy.get('@numberOfStaffSelected').contains('Number of staff selected');
    cy.get('@numberOfStaffSelected').contains('2');
    cy.get('@numberOfStaffSelected').contains('Change');

    cy.get('[data-testid="trainingCategoryDisplay"]').as('trainingCategoryDisplay');
    cy.get('@trainingCategoryDisplay').contains('Training category');
    cy.get('@trainingCategoryDisplay').contains(trainingCategory);
    cy.get('@trainingCategoryDisplay').contains('a', 'Change');

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
    cy.get('[data-testid="notesSection"]').clear().type('Group training');
    cy.contains('button', 'Continue').click();

    // Summary
    cy.contains(workerName1);
    cy.contains(workerName2);
    cy.contains(trainingCategory);
    cy.contains('button', 'Confirm details').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('2 training records added');
  });
});
