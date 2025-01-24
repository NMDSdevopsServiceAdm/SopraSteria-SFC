/* eslint-disable no-undef */
/// <reference types="cypress" />

export class BenchmarksPage {
  benchmarkViewPanels() {
    cy.get('[data-cy="benchmarks-view-panel"]').contains('Pay');
    cy.get('[data-cy="benchmarks-view-panel"]').contains('Recruitment and retention');
    cy.get('[data-cy="benchmarks-view-panel"]').contains('Where you rank');
    cy.get('[data-cy="benchmarks-view-panel"]').contains("Where you're positioned");
  }
}

export const onBenchmarksPage = new BenchmarksPage();
