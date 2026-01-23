/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';

describe('Standalone home page as edit user', { tags: '@workplace' }, () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlyStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  it('should see the standalone establishment workplace page and all sections with no add or change links', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');

    onWorkplacePage.allSectionsAreVisible();

    onWorkplacePage.allSectionsAreNotChangeable();
  });
});
