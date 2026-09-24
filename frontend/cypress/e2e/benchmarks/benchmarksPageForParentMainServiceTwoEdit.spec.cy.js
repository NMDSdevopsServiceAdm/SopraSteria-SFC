/* eslint-disable no-undef */
/// <reference types="cypress" />
import { userPassword } from '../../support/configData';
import { ParentEstablishment } from '../../support/mockEstablishmentData';
import { onBenchmarksPage } from '../../support/page_objects/onBenchmarksPage';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Parent benchmark page, main service 2, as edit user', { tags: '@benchmarks' }, () => {
  before(() => {
    cy.setWorkplaceMainService(ParentEstablishment.id, '25');
  });

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);
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
