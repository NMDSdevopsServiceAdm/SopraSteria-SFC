/* eslint-disable no-undef */
import { userPassword } from '../../support/configData';
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { runTestsForCWPRoleCategories } from './runTestForCWPRoleCategories';

describe('CWP role categories blue banner for parent view subsidiary', { tags: '@staffRecords' }, () => {
  const subsidiary = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidiary.name);

    cy.url().should('contain', 'subsidiary');
    onHomePage.clickTab('Home');
    cy.get('h1').should('contain', subsidiary.name);
  });

  runTestsForCWPRoleCategories(subsidiary);
});
