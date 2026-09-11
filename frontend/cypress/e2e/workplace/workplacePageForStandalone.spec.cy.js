/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { runTestsForWorkplaceQuestions } from './runTestsForWorkplaceQuestions';
import { userPassword } from '../../support/configData';

describe('Standalone workplace page as edit user', { tags: '@workplace' }, () => {
  const establishmentId = StandAloneEstablishment.id;

  const workerName = 'Test worker update staff records';

  before(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
    cy.resetWorkplaceDHAAnswers(establishmentId);
    cy.resetNonMandatoryWorkplaceQuestions(establishmentId);
    cy.insertTestWorker({ establishmentID: establishmentId, workerName });
  });

  beforeEach(() => {
    cy.loginAsUserUsingCySession(StandAloneEstablishment.editUserLoginName, userPassword);
    cy.visitDashboardTab('workplace');
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');

    onWorkplacePage.allSectionsAreVisible();

    onWorkplacePage.allSectionsAreChangeable();
  });

  runTestsForWorkplaceQuestions(StandAloneEstablishment);
});
