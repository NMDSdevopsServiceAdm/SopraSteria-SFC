/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub staff records page as edit user where parent owns data but sub has view workplace and staff records permissions', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUserNonDataOwner'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
  });

  it('should show the staff records page', () => {
    cy.get('[data-cy="add-staff-record-button"]').should('not.exist');
    cy.get('[data-cy="total-staff-panel"]').should('exist');
    cy.get('[data-cy="staff-summary"]').should('exist');
  });
});
