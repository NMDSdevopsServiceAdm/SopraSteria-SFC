/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { userPassword } from '../../support/configData';
import { runTestsForSLVMiniFlow } from './runTestsForSlvMiniFlow.cy';

describe('Starters Leavers Vacancies mini flow from home summary flag', { tags: '@workplace' }, () => {
  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
  });

  const subEstablishment = SubEstablishmentNotDataOwner;
  runTestsForSLVMiniFlow(subEstablishment);
});
