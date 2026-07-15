/* eslint-disable no-undef */
/// <reference types="cypress" />

import { editParentMainServiceSix, userPassword } from '../../support/configData';
import { onBenchmarksPage } from '../../support/page_objects/onBenchmarksPage';
import { onHomePage } from '../../support/page_objects/onHomePage';

xdescribe('Parent benchmark page, main service 6, as edit user', { tags: '@benchmarks' }, () => {
  beforeEach(() => {
    cy.loginAsUser(editParentMainServiceSix, userPassword);
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
