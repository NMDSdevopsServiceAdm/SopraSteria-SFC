/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { onStaffRecordsPage, onStaffRecordSummaryPage } from '../../support/page_objects/onStaffRecordsPage';

describe('Parent staff records page as edit user', { tags: '@staffRecords' }, () => {
  const workerName = 'test worker for staff record page';
  const establishmentID = ParentEstablishment.id;

  before(() => {
    cy.insertTestWorker({ establishmentID, workerName });
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
  });

  it('should show the staff records page', () => {
    cy.get('[data-cy="add-staff-record-button"]').should('contain', 'Add a staff record');
    cy.get('[data-cy="total-staff-panel"]').should('exist');
    cy.get('[data-cy="staff-summary"]').should('exist');
  });

  describe('transfer staff record', () => {
    const testWorker = 'Test transfer staff record';

    before(() => {
      cy.insertTestWorker({ establishmentID, workerName: testWorker });
    });

    after(() => {
      cy.deleteTestWorkerFromDb(testWorker);
    });

    it('should be able to transfer a worker to subsidiary workplace', () => {
      const targetSubsidiary = SubEstablishmentNotDataOwner;

      onStaffRecordsPage.clickIntoWorker(testWorker);

      cy.get('a').contains('Transfer staff record').click();

      // fill in transfer staff record modal box
      cy.get('h1').contains('Transfer staff record').should('be.visible');
      cy.getByLabel('Enter a workplace name or postcode').type(targetSubsidiary.name);
      cy.contains('li', targetSubsidiary.name).click();
      cy.get('button').contains('Transfer').click();

      cy.get('app-alert span').should('contain', `${testWorker} has been moved to ${targetSubsidiary.name}`);

      // view the subsidairy to confirm worker is transferred
      cy.get('app-navigate-to-workplace-dropdown select').select(targetSubsidiary.name);

      cy.url().should('contain', 'subsidiary');
      cy.get('h1').should('contain', targetSubsidiary.name);

      onHomePage.clickTab('Staff records');
      onStaffRecordsPage.clickIntoWorker(testWorker);
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorker);
    });
  });
});
