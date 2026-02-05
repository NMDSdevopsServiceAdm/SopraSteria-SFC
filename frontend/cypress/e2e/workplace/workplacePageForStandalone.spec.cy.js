/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { runTestsForWorkplaceQuestions } from './runTestsForWorkplaceQuestions';

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
    cy.reload();
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
  });

  afterEach(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
    cy.resetWorkplaceDHAAnswers(establishmentId);
    cy.resetNonMandatoryWorkplaceQuestions(establishmentId);
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  it('All sections have a change link', () => {
    onWorkplacePage.allSectionsAreChangeable();
  });

  runTestsForWorkplaceQuestions(StandAloneEstablishment);
});
