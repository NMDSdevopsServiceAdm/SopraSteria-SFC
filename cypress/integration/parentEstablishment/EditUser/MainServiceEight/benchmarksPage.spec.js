/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onBenchmarksPage } from '../../../../support/page_objects/onBenchmarksPage';
import { onHomePage } from '../../../../support/page_objects/onHomePage';

describe('Parent benchmark page, main service 8, as edit user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentMainServiceEight'), Cypress.env('userPassword'));
    onHomePage.clickTab('Benchmarks');
  });

  it('should go to the benchmarks page', () => {
    cy.url().should('include', '#benchmarks');
  });

  it('should show all the comparision panels', () => {
    onBenchmarksPage.benchmarkTiles();
  });

  it('should show the pay page', () => {
    onBenchmarksPage.clickTileLink('Pay');
    cy.url().should('include', '/benchmarks/pay');
    cy.contains('View your other rankings');
  });

  it('should show the turnover page', () => {
    onBenchmarksPage.clickTileLink('Turnover');
    cy.url().should('include', '/benchmarks/turnover');
    cy.contains('View your other rankings');
  });

  it('should show the sickness page', () => {
    onBenchmarksPage.clickTileLink('Sickness');
    cy.url().should('include', '/benchmarks/sickness');
    cy.contains('View your other rankings');
  });

  it('should show the qualifications page', () => {
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
