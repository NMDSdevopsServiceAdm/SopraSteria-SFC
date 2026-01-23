/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';

describe('Standalone home page as edit user', { tags: '@workplace' }, () => {
  const establishmentId = SubEstablishment.id;

  before(() => {
    cy.resetEstablishmentCapacity(establishmentId);
    cy.setWorkplaceMainService(establishmentId, 9);
    cy.insertDummyAnswerForWorkplaceWDFAnswers(establishmentId);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlySubUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  after(() => {
    cy.resetEstablishmentCapacity(establishmentId);
    cy.setWorkplaceMainService(establishmentId, 1);
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  it('should not show add or change links', () => {
    onWorkplacePage.allSectionsAreNotChangeable();
  });
});
