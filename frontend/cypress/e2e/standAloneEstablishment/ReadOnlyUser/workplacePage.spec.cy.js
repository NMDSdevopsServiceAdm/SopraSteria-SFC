/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../../support/page_objects/onWorkplacePage';

describe('Standalone home page as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlyStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.get('[data-testid="standAloneDashboard"]').contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });
});
