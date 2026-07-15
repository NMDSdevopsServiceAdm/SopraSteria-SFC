/* eslint-disable no-undef */
/// <reference types="cypress" />

import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { userPassword } from '../../support/configData';

describe('Update pay for multiple workers', { tags: '@staffRecords' }, () => {
  const establishmentID = StandAloneEstablishment.id;
  const testWorkerNames = Array(20)
    .fill()
    .map((_, index) => (index + 1).toString().padStart('2', '0'))
    .map((workerNumber) => `Update pay for multiple workers ${workerNumber}`);

  const getJobRoleFkValue = (index) => {
    switch (index % 3) {
      case 0:
        return 10; // Care worker
      case 1:
        return 25; // Senior care worker
      case 2:
        return 26; // Senior management
    }
  };

  before(() => {
    cy.archiveAllWorkersInWorkplace(establishmentID);
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    testWorkerNames.forEach((workerName, index) =>
      cy.insertTestWorker({ establishmentID, workerName, mainJobFKValue: getJobRoleFkValue(index) }),
    );
  });

  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);
    onHomePage.clickTab('Staff records');
  });

  it('should see a link for update pay for multiple workers', () => {
    cy.contains('Update pay for multiple staff').as('updatePayForMultipleStaffLink').should('be.visible');
    cy.get('@updatePayForMultipleStaffLink').click();

    cy.url().should('contain', 'update-pay-for-multiple-staff');
    cy.get('h1').should('contain', 'Update pay for multiple staff');
  });

  it('should be able to update pay for multiple workers', () => {
    cy.contains('Update pay for multiple staff').as('updatePayForMultipleStaffLink').should('be.visible');
    cy.get('@updatePayForMultipleStaffLink').click();

    cy.url().should('contain', 'update-pay-for-multiple-staff');

    cy.contains(testWorkerNames[0]).closest('[role="row"]').as('row1');
    cy.get('@row1').within(() => {
      cy.getByLabel(/Hourly pay rate or salary/).type('15');
      cy.get('.govuk-radios').within(() => cy.getByLabel('Hourly').click());
    });

    cy.getByLabel('Sort by').select(1); // Staff name Z to A

    cy.contains(testWorkerNames[19]).closest('[role="row"]').as('row20');
    cy.get('@row20').within(() => {
      cy.getByLabel(/Hourly pay rate or salary/).type('30000');
      cy.get('.govuk-radios').within(() => cy.getByLabel('Salary').click());
    });

    cy.getByLabel('Search by job role').type('Senior');
    cy.contains('li', 'Senior management').click();

    cy.contains(testWorkerNames[2]).closest('[role="row"]').as('row3');
    cy.get('@row3').within(() => {
      cy.get('.govuk-radios').within(() => cy.getByLabel('Not known').click());
    });

    cy.contains('Save and return').click();

    cy.url().should('contain', 'dashboard#staff-records');
    cy.get('.govuk-inset-text.success').should('contain', 'Pay updated in 3 staff records');

    // verify that pay data are updated
    cy.get('a').contains(testWorkerNames[0]).click();
    cy.contains('Hourly pay or annual salary').closest('div').should('contain', '£15.00 hourly pay');

    cy.go('back');
    cy.url().should('contain', 'dashboard#staff-records');
    cy.get('a').contains(testWorkerNames[2]).click();
    cy.contains('Hourly pay or annual salary').closest('div').should('contain', 'Not known');

    cy.go('back');
    cy.url().should('contain', 'dashboard#staff-records');
    cy.getByLabel('Search by name or ID number').type(testWorkerNames[19] + '{enter}');

    cy.get('a').contains(testWorkerNames[19]).click();
    cy.contains('Hourly pay or annual salary').closest('div').should('contain', '£30,000 annual salary');
  });
});
