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
    cy.contains('Training and qualifications');

    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
    cy.contains('button', 'Add and manage training');

    cy.get('a').contains('Add multiple training records').should('not.be.visible');
    cy.get('a').contains('Add and manage training courses').should('not.be.visible');
    cy.get('a').contains('Add a mandatory training category').should('not.be.visible');
    cy.get('a').contains('Manage expiry alerts').should('not.be.visible');

    cy.contains('Download training report').should('not.exist');
    cy.contains('Download parent training report').should('not.exist');
  });

  describe('"Add and manage training" sub-menu after the button has been clicked', () => {
    it('should show the "Add multiple training records" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add multiple training records').click();
      cy.url().should('include', 'add-multiple-training/select-staff');
      cy.get('span').should('contain', 'Add multiple training records');
    });

    it('should show the "Add and manage training courses" item', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add and manage training courses').click();
      cy.get('h1').should('contain', 'Add and manage training courses');
    });

    it('should show the "Add a mandatory training category" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add a mandatory training category').click();
      cy.url().should('include', 'add-and-manage-mandatory-training');
      cy.get('span').should('contain', 'Add a mandatory training category');
    });

    it('should show the "Manage expiry alerts" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Manage expiry alerts').click();
      cy.url().should('include', 'change-expires-soon-alerts');
      cy.get('h1').should('contain', 'Manage expiry alerts');
    });
  });

  it('should show all sections', () => {
    onTrainingAndQualsPage.sectionsAreVisible();
  });
});
