/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub staff records page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
  });

  it('should show the staff records page', () => {
    cy.get('[data-cy="add-staff-record-button"]').should('contain', 'Add a staff record');
    cy.get('[data-cy="total-staff-panel"]').should('exist');
    cy.get('[data-cy="staff-summary"]').should('exist');
  });
});
