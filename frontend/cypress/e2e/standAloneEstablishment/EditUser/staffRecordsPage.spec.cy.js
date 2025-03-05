/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Standalone staff records page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
  });

  it('should show the staff records page', () => {
    cy.get('[data-cy="dashboard-header"]').should('contain', 'df');
    cy.get('[data-cy="dashboard-header"]').find('[data-testid="lastUpdatedDate"]').should('exist');
    cy.get('[data-cy="dashboard-header"]').should('contain', 'Add a staff record');
    cy.get('[data-testid="staff-records"]').should('exist');
  });

  describe('Adding mandatory details for a staff record', () => {
    it('should add a new staff record successfully', () => {
      const name = 'Mr Cool';
      const contractType = 'Permanent';
      const mainJobRole = 'Care worker';

      createStaffRecordWithMandatoryDetails(name, contractType, mainJobRole);

      expectContentToBeDisplayedOnMandatoryDetailsPage(name, contractType, mainJobRole);
    });

    it('should update name and contract type when changed after creating new record', () => {
      const updatedName = 'Mr Smith';
      const updatedContractType = 'Temporary';

      const { name } = createStaffRecordWithMandatoryDetails();

      cy.contains('.govuk-summary-list__row', name).find('.govuk-summary-list__actions a').click();

      inputNameAndContractType(updatedName, updatedContractType, 'Save and return');
      cy.contains('.govuk-summary-list__value', updatedName).should('be.visible');
      cy.contains('.govuk-summary-list__value', updatedContractType).should('be.visible');
    });

    it('should update job role when changed after creating new record', () => {
      const updatedJobRole = 'Support worker';

      const { mainJobRole } = createStaffRecordWithMandatoryDetails();

      cy.contains('.govuk-summary-list__row', mainJobRole).find('.govuk-summary-list__actions a').click();

      cy.get('label').contains(updatedJobRole).parent().find('input').click();
      cy.contains('button', 'Save and return').click();
      cy.contains('.govuk-summary-list__value', updatedJobRole).should('be.visible');
    });

    it('should show validation error if Name or ID number is empty', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();
      cy.contains('button', 'Continue').click();
      cy.contains('.govuk-error-message', 'Enter their name or ID number').should('be.visible');
    });

    it('should show validation error if no contract type selected', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();
      cy.get('label').contains('Name or ID number').parent().find('input').type('Mr Cool');
      cy.contains('button', 'Continue').click();

      cy.contains('.govuk-error-message', 'Select the type of contract they have').should('be.visible');
    });

    it('should show validation error if no job role is selected', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();

      // staff-details
      cy.get('label').contains('Name or ID number').parent().find('input').type('Mr Cool');
      cy.get('label').contains('Permanent').parent().find('input').click();
      cy.contains('button', 'Continue').click();

      // main-job-role
      cy.contains('button', 'Save this staff record').click();
      cy.contains('.govuk-error-message', 'Select the job role').should('be.visible');
    });

    it('should prefill name and contract type when navigating back', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();

      // staff-details
      cy.get('label').contains('Name or ID number').parent().find('input').type('Mr Cool');
      cy.get('label').contains('Permanent').parent().find('input').click();
      cy.contains('button', 'Continue').click();

      cy.go('back');
      cy.get('label').contains('Name or ID number').parent().find('input').should('have.value', 'Mr Cool');
      cy.get('label').contains('Permanent').parent().find('input').should('be.checked');
    });
  });

  const createStaffRecordWithMandatoryDetails = (
    name = 'Bob',
    contractType = 'Permanent',
    mainJobRole = 'Care worker',
  ) => {
    cy.get('a[role="button"]').contains('Add a staff record').click();

    inputNameAndContractType(name, contractType);
    inputMainJobRole(mainJobRole);

    return { name, contractType, mainJobRole };
  };

  const inputNameAndContractType = (name = 'Bob', contractType = 'Permanent', buttonText = 'Continue') => {
    cy.get('label').contains('Name or ID number').parent().find('input').type(name);
    cy.get('label').contains(contractType).parent().find('input').click();
    cy.contains('button', buttonText).click();
  };

  const inputMainJobRole = (mainJobRole, buttonText = 'Save this staff record') => {
    cy.get('button').contains('span', 'Care providing roles').click();
    cy.get('label').contains(mainJobRole).parent().find('input').click();
    cy.contains('button', buttonText).click();
  };

  const expectContentToBeDisplayedOnMandatoryDetailsPage = (name, contractType, mainJobRole) => {
    cy.contains('h1', 'Add a staff record').should('be.visible');
    cy.contains('.govuk-inset-text', 'Staff record saved').should('be.visible');
    cy.contains('.govuk-summary-list__value', name).should('be.visible');
    cy.contains('.govuk-summary-list__value', contractType).should('be.visible');
    cy.contains('.govuk-summary-list__value', mainJobRole).should('be.visible');
  };
});
