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

  describe('Adding a staff record', () => {
    it('should add a new staff record successfully', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();

      // staff-details
      cy.get('label').contains('Name or ID number').parent().find('input').type('Mr Cool');
      cy.get('label').contains('Permanent').parent().find('input').click();
      cy.contains('button', 'Continue').click();

      // main-job-role
      cy.get('button').contains('span', 'Care providing roles').click();
      cy.get('label').contains('Care worker').parent().find('input').click();
      cy.contains('button', 'Save this staff record').click();

      // mandatory-details
      cy.contains('h1', 'Add a staff record').should('be.visible');
      cy.contains('.govuk-inset-text', 'Staff record saved').should('be.visible');
      cy.contains('.govuk-summary-list__value', 'Permanent').should('be.visible');
      cy.contains('.govuk-summary-list__value', 'Care worker').should('be.visible');
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

    it('should show validation error if no care providing role is selected', () => {
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
});
