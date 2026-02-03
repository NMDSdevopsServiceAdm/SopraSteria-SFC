/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { runTestsForWorkplaceQuestions } from './runTestsForWorkplaceQuestions';

describe('Workplace page for Parent viewing subsidiary', () => {
  const subsidaryToView = SubEstablishmentNotDataOwner;
  const establishmentId = subsidaryToView.id;

  const workerName = 'Test worker update staff records';

  before(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
    cy.resetWorkplaceDHAAnswers(establishmentId);
    cy.resetNonMandatoryWorkplaceQuestions(establishmentId);
    cy.insertTestWorker({ establishmentID: establishmentId, workerName });
  });

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidaryToView.name);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', subsidaryToView.name);

    cy.get('[data-cy="tab-list"]').contains('Workplace').click();

    cy.reload();
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

  runTestsForWorkplaceQuestions(subsidaryToView);
});
