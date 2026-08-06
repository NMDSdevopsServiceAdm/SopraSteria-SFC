import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForFundingPages } from './runTestsForFunding';
import { userPassword } from '../../support/configData';

describe('Funding page', { tags: '@funding' }, () => {
  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);
    cy.url().should('contain', 'dashboard');
  });

  const subsidaryToView = SubEstablishmentNotDataOwner;
  runTestsForFundingPages(subsidaryToView);
});
