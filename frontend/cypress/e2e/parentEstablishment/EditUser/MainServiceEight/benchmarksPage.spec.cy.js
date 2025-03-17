/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onBenchmarksPage } from '../../../../support/page_objects/onBenchmarksPage';
import { onHomePage } from '../../../../support/page_objects/onHomePage';

describe('Parent benchmark page, main service 8, as edit user', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentMainServiceEight'), Cypress.env('userPassword'));
    onHomePage.clickTab('Benchmarks');
  });

  it('should go to the benchmarks page', () => {
    cy.url().should('include', '#benchmarks');
  });

  it('should show all the comparison panels', () => {
    onBenchmarksPage.benchmarkViewPanels();
  });

  it('should show about data link', () => {
    cy.contains('About the data');
  });
});
