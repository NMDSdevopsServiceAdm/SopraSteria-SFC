/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';

describe('Sub home page as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  it('should see the sub establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  it('should show add or change links', () => {
    onWorkplacePage.allSectionsAreChangeable();
  });
});
