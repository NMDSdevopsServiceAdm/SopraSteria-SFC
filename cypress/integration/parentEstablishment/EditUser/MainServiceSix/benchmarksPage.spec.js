/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onBenchmarksPage } from '../../../../support/page_objects/onBenchmarksPage';
import { onHomePage } from '../../../../support/page_objects/onHomePage';

describe('Parent benchmark page, main service 6, as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentMainServiceSix'), Cypress.env('userPassword'));
    onHomePage.clickTab('Benchmarks');
  });

  it('should go to the benchmarks page', () => {
    cy.url().should('include', '#benchmarks');
  });

  it('should show all the comparision panels', () => {
    onBenchmarksPage.benchmarkTiles();
  });

  it('should not show a pay tile link', () => {
    cy.get('[data-cy="benchmarks-tiles"]').contains('Pay').should('not.have.attr', 'a');
  });

  it('should not show a turnover tile link', () => {
    cy.get('[data-cy="benchmarks-tiles"]').contains('Turnover').should('not.have.attr', 'a');
  });

  it('should not show a sickness tile link', () => {
    cy.get('[data-cy="benchmarks-tiles"]').contains('Sickness').should('not.have.attr', 'a');
  });

  it('should not show a qualifications tile link', () => {
    cy.get('[data-cy="benchmarks-tiles"]').contains('Qualifications').should('not.have.attr', 'a');
  });

  it('should show about data link', () => {
    cy.contains('About the data');
  });

  it('should show pdf download link', () => {
    cy.contains('Download Benchmarks PDF');
  });
});
