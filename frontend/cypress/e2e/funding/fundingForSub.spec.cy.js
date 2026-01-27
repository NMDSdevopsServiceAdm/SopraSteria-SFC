import { SubEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';

describe('Funding page', () => {
  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, Cypress.env('userPassword'));
    cy.url().should('contain', 'dashboard');
  });
  runTestsForFundingPages(SubEstablishment);
});
