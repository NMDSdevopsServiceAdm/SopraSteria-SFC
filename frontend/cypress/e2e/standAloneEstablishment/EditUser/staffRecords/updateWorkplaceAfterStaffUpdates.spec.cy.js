/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../../support/page_objects/onHomePage';

describe.only('Updating workplace after staff updates', () => {
  const noOfStaffBeforeUpdate = 4;
  const name1 = 'New Staff 01';
  const name2 = 'New Staff 02';
  const contractType = 'Permanent';
  const mainJobRole1 = 'Care worker';
  const mainJobRole2 = 'Senior care worker'
  const testWorkerNames = [name1, name2];

  before(() => {
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    cy.resetStartersLeaversVacancies(180)
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

    onHomePage.clickTab('Workplace');
    // cy.get('[data-testid="number-of-staff-top-row"]').contains('Change').click();
    // cy.getByLabel('Number of staff').clear().type(noOfStaffBeforeUpdate);
    // cy.contains('button', 'Save and return').click();

    cy.get('[data-testid="vacancies-top-row"]').contains('Add').click();

    cy.getByLabel('Yes').click();
    cy.contains('button', 'Continue').click();
    cy.contains('button', 'Show all job roles').click();
    cy.getByLabel(mainJobRole1).click();
    cy.getByLabel(mainJobRole2).click();
    cy.contains('button', 'Continue').click();
    cy.getByLabel(mainJobRole1).clear().type(2);
    cy.getByLabel(mainJobRole2).clear().type(1);
    cy.contains('button', 'Save and return').click();
    onHomePage.clickTab('Staff records');
  });

  afterEach(() => {
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
  });

  it('updates successfully after adding staff', () => {
    cy.get('a[role="button"]').contains('Add a staff record').click();

    addAndConfirmMandatoryStaffDetails(name1, contractType, mainJobRole1);
    cy.getByLabel('Yes').click();
    cy.contains('button', 'Continue').click();

    addAndConfirmMandatoryStaffDetails(name2, contractType, mainJobRole1);
    cy.getByLabel('No').click();
    cy.contains('button', 'Continue').click();

    cy.contains('h1', 'Check this information and make any changes before you continue').should('be.visible');
    cy.contains('h2', 'Total number of staff, vacancies and starters').should('be.visible');

    cy.get('[data-testid="numberOfStaff"]').contains('Change').click();
    cy.contains('h1', 'Update the total number of staff for your workplace').should('be.visible');

    cy.get('[data-testid="plus-button-total-number-of-staff"]').click();
    cy.get('[data-testid="plus-button-total-number-of-staff"]').click();
    cy.contains('button', 'Save and return').click();
    cy.get('[data-testid="numberOfStaff"]').contains(`${noOfStaffBeforeUpdate + 2}`);

    cy.get('[data-testid="vacancies"]').contains('Change').click();
    cy.get('[data-testid="remove-button-Care worker"]').contains('Remove').click();
    cy.contains('button', 'Save and return').click();

    cy.get('[data-testid="starters"]').contains('Add').click();
    cy.contains('button', 'Add job roles').click();
    cy.contains('button', 'Show all job roles').click();
    cy.getByLabel(mainJobRole1).click();
    cy.contains('button', 'Continue').click();
    cy.get('[data-testid="plus-button-job-0"]').click();
    cy.contains('button', 'Save and return').click();

    cy.get('[data-testid="numberOfStaff"]').contains('6')
    cy.get('[data-testid="vacancies"]').contains('1 x senior care worker')
    cy.get('[data-testid="starters"]').contains('2 x care worker')
    cy.contains("Total number of staff, vacancies and starters information saved")
    cy.contains('button', 'Continue').click();
    cy.contains(`${mainJobRole1}`)
    cy.contains(`${mainJobRole2}`)
  });

  const addAndConfirmMandatoryStaffDetails = (name = 'Bob', contractType = 'Permanent', mainJobRole) => {
    inputNameAndContractType(name, contractType);
    inputMainJobRole(mainJobRole);

    cy.contains('button', 'Add details to this record').click();
    cy.contains('a', 'View this staff record').click();
    cy.contains('a', 'Continue').click();
  };

  const inputNameAndContractType = (name = 'Bob', contractType = 'Permanent', buttonText = 'Continue') => {
    cy.getByLabel('Name or ID number').clear().type(name);
    cy.getByLabel(contractType).click();
    cy.contains('button', buttonText).click();
  };

  const inputMainJobRole = (mainJobRole, buttonText = 'Save this staff record') => {
    cy.get('button').contains('span', 'Care providing roles').click();
    cy.getByLabel(mainJobRole).click();
    cy.contains('button', buttonText).click();
  };
});
