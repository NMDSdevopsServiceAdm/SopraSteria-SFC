/* eslint-disable no-undef */
/// <reference types="cypress" />

export class BenchmarksPage {
  benchmarkViewPanels() {
    cy.get('[data-cy="benchmarks-view-panel"]').contains('Pay');
    cy.get('[data-cy="benchmarks-view-panel"]').contains('Recruitment and retention');
    cy.get('[data-cy="benchmarks-view-panel"]').contains('Where you rank');
    cy.get('[data-cy="benchmarks-view-panel"]').contains("Where you're positioned");
  }

  benchmarkV1Tiles() {
    cy.get('app-benchmark-tile').should('have.length', 4);

    cy.get('app-benchmark-tile').contains('h2', 'Pay');
    cy.get('app-benchmark-tile').contains('h2', 'Turnover');
    cy.get('app-benchmark-tile').contains('h2', 'Sickness');
    cy.get('app-benchmark-tile').contains('h2', 'Qualifications');
  }
}

export const onBenchmarksPage = new BenchmarksPage();
