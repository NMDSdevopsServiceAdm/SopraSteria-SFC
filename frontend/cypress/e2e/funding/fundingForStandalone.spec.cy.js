import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';
import { userPassword } from '../../support/configData';

describe('Funding page', { tags: '@funding' }, () => {
  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);
    cy.url().should('contain', 'dashboard');
  });

  runTestsForFundingPages(StandAloneEstablishment);
});
