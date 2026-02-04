/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { onTrainingAndQualsPage } from '../../support/page_objects/onTrainingAndQualsPage';

describe('Standalone training and qualifications page as edit user', { tags: '@trainingAndQualifications' }, () => {
  const workerName = 'Cypress test worker';
  const establishmentID = StandAloneEstablishment.id;

  before(() => {
    cy.archiveAllWorkersInWorkplace(establishmentID);
    cy.insertTestWorker({ establishmentID, workerName });
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Training and qualifications');
  });

  it('should see the standalone establishment training and quals page', () => {
    cy.url().should('include', '#training-and-qualifications');
    cy.contains('Training and qualifications');

    cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
    cy.contains('button', 'Add and manage training');

    cy.get('a').contains('Add multiple training records').should('not.be.visible');
    cy.get('a').contains('Add training courses').should('not.be.visible');
    cy.get('a').contains('Manage mandatory training').should('not.be.visible');
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

    it('should show the "Add training courses" item', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Add training courses').click();
      cy.get('h1').should('contain', 'Add and manage training courses');
    });

    it('should show the "Manage mandatory training" item with the correct link', () => {
      cy.contains('button', 'Add and manage training').click();
      cy.contains('Manage mandatory training').click();
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
