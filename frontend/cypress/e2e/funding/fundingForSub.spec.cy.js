import { SubEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';
import { userPassword } from '../../support/configData';

describe('Funding page', { tags: '@funding' }, () => {
  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, userPassword);
    cy.url().should('contain', 'dashboard');
  });
  runTestsForFundingPages(SubEstablishment);
});
