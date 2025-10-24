/* eslint-disable no-undef */
/// <reference types="cypress" />

const { ParentEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('Parent training and quals page as edit user', () => {
  const workerName = 'test worker for training & quals';
  const establishmentID = ParentEstablishment.id;

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: ParentEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
    cy.insertTestWorker({ establishmentID, workerName });
    cy.addWorkerTraining({ establishmentID: ParentEstablishment.id, workerName: workerName, categoryId: 4 });
  });

  after(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: ParentEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.reload();
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should show the training and qualifications page', () => {
    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
    cy.contains('button', 'Add and manage training');

    cy.contains('Download training report');
    cy.contains('Download parent training report');
  });

  describe('"Add and manage training" sub-menu before the button has been clicked', () => {
    it ('should not show the sub-menu items', () => {
      // 'Add multiple training records' sub-menu
      cy.get(':nth-child(1) > a.asc-button-menu__item').should('not.be.visible');
      // 'Add and manage training courses' sub-menu
      cy.get('button.asc-button-menu__item').should('not.be.visible');
      // 'Add a mandatory training category' sub-menu
      cy.get(':nth-child(2) > .asc-button-menu__item').should('not.be.visible');
      // 'Manage expiry alerts' sub-menu
      cy.get(':nth-child(3) > .asc-button-menu__item').should('not.be.visible');
    });
  });

  describe('"Add and manage training" sub-menu after the button has been clicked', () => {
    it('should show the "Add multiple training records" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add multiple training records').click();
      cy.url().should('include', 'add-multiple-training/select-staff')
      cy.get('span').should('contain', 'Add multiple records');
    });

    it('should show the "Add and manage training courses" item', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add and manage training courses')
    });

    it('should show the "Add a mandatory training category" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add a mandatory training category').click();
      cy.url().should('include', 'add-and-manage-mandatory-training')
      cy.get('span').should('contain', 'Add a mandatory training category');
    });

    it('should show the "Manage expiry alerts" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Manage expiry alerts').click();
      cy.url().should('include', 'change-expires-soon-alerts')
      cy.get('h1').should('contain', 'Manage expiry alerts');
    });
  });
});
