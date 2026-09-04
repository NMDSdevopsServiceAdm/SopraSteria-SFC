/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForWorkplaceQuestions } from './runTestsForWorkplaceQuestions';
import { userPassword } from '../../support/configData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Workplace page for Parent viewing subsidiary', { tags: '@workplace' }, () => {
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
    cy.loginAsUserUsingCySession(ParentEstablishment.editUserLoginName, userPassword, 'home');

    cy.log(subsidaryToView.uid, '<--- subsidaryToView.uid');
    cy.visitDashboardTab('home', subsidaryToView.uid);

    cy.url().should('contain', 'subsidiary');
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
