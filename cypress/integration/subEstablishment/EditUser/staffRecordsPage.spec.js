/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub staff records page as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
  });

  it('should show the staff records page', () => {
    cy.get('[data-cy="dashboard-header"]').should('contain', 'df');
    cy.get('[data-cy="dashboard-header"]').find('[data-testid="lastUpdatedDate"]').should('exist');
    cy.get('[data-cy="dashboard-header"]').should('contain', 'Add a staff record');
  });
});
