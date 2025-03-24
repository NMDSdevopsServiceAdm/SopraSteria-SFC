/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../../support/page_objects/onWorkplacePage';

describe('Standalone home page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlyParentUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  it('should see the parent establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.get('[data-testid="parentDashboard"]').contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });
});
