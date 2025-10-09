import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';

describe('Funding page', () => {
  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));
    cy.url().should('contain', 'dashboard#home');
  });

  runTestsForFundingPages(StandAloneEstablishment);
});
