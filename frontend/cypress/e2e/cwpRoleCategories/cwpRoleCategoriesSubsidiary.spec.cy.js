/* eslint-disable no-undef */
import { userPassword } from '../../support/configData';
import { SubEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForCWPRoleCategories } from './runTestForCWPRoleCategories';

describe('CWP role categories blue banner for subsidiary workplace', { tags: '@staffRecords' }, () => {
  const subsidiary = SubEstablishment;

  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');

    cy.get('h1').should('contain', SubEstablishment.name);
  });

  runTestsForCWPRoleCategories(subsidiary);
});
