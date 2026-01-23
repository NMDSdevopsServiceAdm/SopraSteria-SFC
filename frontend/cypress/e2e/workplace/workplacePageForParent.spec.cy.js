/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { ParentEstablishment } from '../../support/mockEstablishmentData';

describe('Standalone home page as edit user', { tags: '@workplace' }, () => {
  const establishmentId = ParentEstablishment.id;

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  it('should see the parent establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  it.skip('goes to the CQC location ID page', () => {
    cy.get('[data-testid="cqcLocationId"]').as('testId');
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', 'Enter the postcode or location ID');

    //can't update as there isn't a dev version of the cqc api key
    cy.contains('a', 'Cancel').click();
  });

  describe('data sharing', () => {
    it('updates for just local authorities', () => {
      cy.resetWorkplaceShareDataWith(establishmentId);
      const heading = 'Share your data';

      cy.get('[data-testid="data-sharing"]').as('testId');

      cy.get('@testId').contains('Add').click();

      cy.get('h1').should('contain.text', heading);
      cy.getByLabel('Yes, I agree to you sharing our data with local authorities').click();
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains('Local authorities');
      cy.get('@testId').contains('Change').click();

      cy.get('h1').should('contain.text', heading);
    });

    it.skip('updates data sharing for local authorities and cqc', () => {
      cy.resetWorkplaceShareDataWith(establishmentId);
      const heading = 'Share your data';

      cy.get('[data-testid="data-sharing"]').as('testId');

      cy.get('@testId').contains('Add').click();

      cy.get('h1').should('contain.text', heading);
      cy.getByLabel('Yes, I agree to you sharing our data with the CQC').click();
      cy.getByLabel('Yes, I agree to you sharing our data with local authorities').click();
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains('Care Quality Commission (CQC)');
      cy.get('@testId').contains('Local authorities');
      cy.get('@testId').contains('Change').click();

      cy.get('h1').should('contain.text', heading);
    });
  });

  it('should show add or change links', () => {
    onWorkplacePage.allSectionsAreChangeable();
  });
});
