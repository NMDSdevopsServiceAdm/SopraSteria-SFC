import { userPassword } from '../../support/configData';
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForCWPRoleCategories } from './runTestsForCWPRoleCategories';

describe('CWP role categories blue banner for parent viewing subsidiary', { tags: '@staffRecords' }, () => {
  const subsidiaryToView = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidiaryToView.name);

    cy.url().should('contain', 'subsidiary');
    cy.get('h1').should('contain', subsidiaryToView.name);
  });

  runTestsForCWPRoleCategories(subsidiaryToView);
});
