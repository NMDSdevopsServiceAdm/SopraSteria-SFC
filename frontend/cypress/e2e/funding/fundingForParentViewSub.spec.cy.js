import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';

describe('Funding page', { tags: '@funding' }, () => {
  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, Cypress.env('userPassword'));
    cy.url().should('contain', 'dashboard');
  });

  const subsidaryToView = SubEstablishmentNotDataOwner;
  runTestsForFundingPages(subsidaryToView);
});
