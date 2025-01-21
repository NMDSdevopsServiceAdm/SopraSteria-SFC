/* eslint-disable no-undef */
/// <reference types="cypress" />

export class HomePage {
  allTabs(userRole = 'edit') {
    if (userRole === 'edit') {
      cy.get('[data-cy="tab-list"]').contains('Staff records');
      cy.get('[data-cy="tab-list"]').contains('Training and qualifications');
    } else {
      cy.get('[data-cy="tab-list"]').contains('Staff records').should('not.exist');
      cy.get('[data-cy="tab-list"]').contains('Training and qualifications').should('not.exist');
    }
    cy.get('[data-cy="tab-list"]').contains('Home');
    cy.get('[data-cy="tab-list"]').contains('Workplace');
    cy.get('[data-cy="tab-list"]').contains('Benchmarks');
  }

  clickTab(tab) {
    cy.get('[data-cy="tab-list"]').contains(tab).click();
  }
}

export const onHomePage = new HomePage();
