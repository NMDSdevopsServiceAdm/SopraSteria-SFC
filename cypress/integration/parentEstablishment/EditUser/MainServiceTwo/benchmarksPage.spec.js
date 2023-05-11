/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onBenchmarksPage } from '../../../../support/page_objects/onBenchmarksPage';

describe('Parent benchmark page, main service 2, as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentMainServiceTwo'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Benchmarks').click();
  });

  it('should go to the benchmarks page', () => {
    cy.url().should('include', '#benchmarks');
  });

  it('should show all the comparision panels', () => {
    onBenchmarksPage.benchmarkTiles();
  });

  it('should be able to access the pay tile link', () => {
    onBenchmarksPage.clickTileLink('Pay');
    cy.url().should('include', '/benchmarks/pay');
    cy.contains('View your other rankings');
  });

  it('should be able to access the turnover tile link', () => {
    onBenchmarksPage.clickTileLink('Turnover');
    cy.url().should('include', '/benchmarks/turnover');
    cy.contains('View your other rankings');
  });

  it('should be able to access the sickness tile link', () => {
    onBenchmarksPage.clickTileLink('Sickness');
    cy.url().should('include', '/benchmarks/sickness');
    cy.contains('View your other rankings');
  });

  it('should be able to access the qualifications tile link', () => {
    onBenchmarksPage.clickTileLink('Qualifications');
    cy.url().should('include', '/benchmarks/qualifications');
    cy.contains('View your other rankings');
  });

  it('should show about data link', () => {
    cy.contains('About the data');
  });

  it('should show pdf download link', () => {
    cy.contains('Download Benchmarks PDF');
  });
});
