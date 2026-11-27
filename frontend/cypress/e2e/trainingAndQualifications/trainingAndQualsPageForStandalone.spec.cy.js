/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { onTrainingAndQualsPage } from '../../support/page_objects/onTrainingAndQualsPage';
import { userPassword } from '../../support/configData';
import { clickIntoManageTAndQRecordPage } from './trainingCourse/helpers';
import { runTestsForTrainingAndQualsTab } from './runTestsForTrainingAndQualsTab.spec';

describe('Standalone training and qualifications page as edit user', { tags: '@trainingAndQualifications' }, () => {
  const workerName = 'Cypress test worker for stand alone';
  const establishmentID = StandAloneEstablishment.id;

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
    cy.deleteTestWorkerFromDb(workerName);
    cy.insertTestWorker({ establishmentID, workerName });
    cy.addWorkerTraining({ establishmentID, workerName, categoryId: 4 });
  });

  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);
    onHomePage.clickTab('Training and qualifications');
  });

  runTestsForTrainingAndQualsTab(StandAloneEstablishment);

  it('should show all sections in manage training and qualification records page', () => {
    clickIntoManageTAndQRecordPage();
    onTrainingAndQualsPage.sectionsAreVisible();
  });
});
