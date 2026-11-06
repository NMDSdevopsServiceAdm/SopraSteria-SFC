import { userPassword } from '../../support/configData';
import { ParentEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForCWPRoleCategories } from './runTestForCWPRoleCategories';

describe('CWP role categories blue banner for parent workplace', { tags: '@staffRecords' }, () => {
  beforeEach(() => {
    expect(ParentEstablishment.editUserLoginName).to.be.a('string').and.not.be.empty;

    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', ParentEstablishment.name);
  });

  runTestsForCWPRoleCategories(ParentEstablishment);
});
