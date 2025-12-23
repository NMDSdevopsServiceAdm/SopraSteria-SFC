/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('qualification record', () => {
  const workerName1 = 'Test worker';
  const workerName2 = 'Test worker 2';

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName1 });
    cy.deleteWorkerTrainingRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName2 });

    cy.deleteTestWorkerFromDb(workerName1);
    cy.deleteTestWorkerFromDb(workerName2);

    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: workerName1 });
    cy.reload();
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
  });

  afterEach(() => {
    cy.deleteWorkerQualificationsRecord({ establishmentID: StandAloneEstablishment.id, workerName: workerName1 });
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName1);
  });

  const qualificationName = 'Adult care worker (standard, level 2)';

  it('should add successfully', () => {
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
    cy.contains('a', 'Add a qualification record').click();

    // select qualification
    cy.contains('button', 'Show all categories').click();
    cy.getByLabel(qualificationName).click();
    cy.contains('button', 'Continue').click();

    // add qualification record details
    cy.contains(qualificationName);
    cy.contains('a', 'Change');
    cy.getByLabel('Year achieved').clear().type(2025);
    cy.contains('button', 'Open notes').click();
    cy.get('[data-testid="notesSection"]').clear().type('Refresh');
    cy.contains('button', 'Save record').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('Qualification record added');
    cy.contains(qualificationName);
  });

  it('should update successfully', () => {
    cy.addWorkerQualification({
      establishmentID: StandAloneEstablishment.id,
      workerName: workerName1,
      categoryId: 121,
    });
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
    cy.contains('a', qualificationName).click();

    // update qualification record details
    cy.contains(qualificationName);
    cy.getByLabel('Year achieved').clear().type(2025);
    cy.contains('button', 'Save and return').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('Qualification record saved');
  });

  it('should delete successfully', () => {
    cy.addWorkerQualification({
      establishmentID: StandAloneEstablishment.id,
      workerName: workerName1,
      categoryId: 121,
    });
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
    cy.contains('a', qualificationName).click();

    // update qualification record details
    cy.contains(qualificationName);

    // training record
    cy.contains('a', 'Delete this qualification record').click();

    // Confirm deletion
    cy.contains('button', 'Delete record').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('Qualification record deleted');
  });
});
