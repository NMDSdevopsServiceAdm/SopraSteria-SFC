import { ParentEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';

describe('Funding page', () => {
  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, Cypress.env('userPassword'));
    cy.url().should('contain', 'dashboard#home');
  });

  runTestsForFundingPages(ParentEstablishment);
});
