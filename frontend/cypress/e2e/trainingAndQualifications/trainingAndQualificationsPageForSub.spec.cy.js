/* eslint-disable no-undef */
/// <reference types="cypress" />

const { SubEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('Sub training and quals page as edit user', () => {
  const workerName = 'test worker for training & quals';
  const establishmentID = SubEstablishment.id;

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: SubEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
    cy.insertTestWorker({ establishmentID, workerName });
    cy.addWorkerTraining({ establishmentID: SubEstablishment.id, workerName: workerName, categoryId: 4 });
  });

  after(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: SubEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.reload();
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should show the training and qualifications page', () => {
    cy.get('[data-testid="trainingLinkPanel"]').should('exist');
    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
    cy.contains('button', 'Add and manage training');

    cy.get('a').contains('Add multiple training records').should('not.be.visible');
    cy.get('a').contains('Add training courses details').should('not.be.visible');
    cy.get('a').contains('Manage mandatory training').should('not.be.visible');
    cy.get('a').contains('Manage expiry alerts').should('not.be.visible');
    cy.get('a').contains('Update records with training course details').should('not.be.visible');

    cy.contains('Download training report');
    cy.contains('Download parent training report').should('not.exist');
  });

  describe('"Add and manage training" sub-menu after the button has been clicked', () => {
    it('should show the "Add multiple training records" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add multiple training records').click();
      cy.url().should('include', 'add-multiple-training/select-staff');
      cy.get('span').should('contain', 'Add multiple records');
    });

    it('should show the "Add training courses details" item', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add training courses details').click();
      cy.get('h1').should('contain', 'Add training courses details');
    });

    it('should show the "Manage mandatory training" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Manage mandatory training').click();
      cy.url().should('include', 'add-and-manage-mandatory-training');
      cy.get('span').should('contain', 'Manage mandatory training');
    });

    it('should show the "Manage expiry alerts" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Manage expiry alerts').click();
      cy.url().should('include', 'change-expires-soon-alerts');
      cy.get('h1').should('contain', 'Manage expiry alerts');
    });

    it('should show the "Update records with training course details" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Update records with training course details').click();
      cy.get('h1').should('contain', 'Update records with training course details');
    });
  });
});
