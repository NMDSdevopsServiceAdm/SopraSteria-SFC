/* eslint-disable no-undef */
/// <reference types="cypress" />

export class BenchmarksPage {
  benchmarkTiles() {
    cy.get('[data-cy="benchmarks-tiles"]').contains('Pay');
    cy.get('[data-cy="benchmarks-tiles"]').contains('Turnover');
    cy.get('[data-cy="benchmarks-tiles"]').contains('Sickness');
    cy.get('[data-cy="benchmarks-tiles"]').contains('Qualifications');
  }

  clickTileLink(tileLink) {
    cy.get('[data-cy="benchmarks-tiles"]').contains(tileLink).click();
  }
}

export const onBenchmarksPage = new BenchmarksPage();
