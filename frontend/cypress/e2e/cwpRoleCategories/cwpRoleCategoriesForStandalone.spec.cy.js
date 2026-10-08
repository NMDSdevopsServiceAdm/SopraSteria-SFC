import { userPassword } from '../../support/configData';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForCWPRoleCategories } from './runTestsForCWPRoleCategories';

describe('CWP role categories blue banner for standalone workplace', { tags: '@staffRecords' }, () => {
  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', StandAloneEstablishment.name);
  });

  runTestsForCWPRoleCategories(StandAloneEstablishment);
});
