/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { userPassword } from '../../support/configData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { runTestsForSLVMiniFlow } from './runTestsForSlvMiniFlow.cy';

describe('Starters Leavers Vacancies mini flow from home summary flag', { tags: '@workplace' }, () => {
  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
  });

  runTestsForSLVMiniFlow(StandAloneEstablishment);
});
