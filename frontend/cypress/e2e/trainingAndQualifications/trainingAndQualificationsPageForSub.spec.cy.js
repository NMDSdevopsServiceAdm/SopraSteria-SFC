/* eslint-disable no-undef */
/// <reference types="cypress" />

const { SubEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');
import { userPassword } from '../../support/configData';
import { runTestsForTrainingAndQualsTab } from './runTestsForTrainingAndQualsTab.spec';

describe('Sub training and quals page as edit user', { tags: '@trainingAndQualifications' }, () => {
  const workerName = 'test worker for training & quals';
  const establishmentID = SubEstablishment.id;

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: SubEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
    cy.insertTestWorker({ establishmentID, workerName });
    cy.addWorkerTraining({ establishmentID: SubEstablishment.id, workerName: workerName, categoryId: 4 });
  });

  after(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: SubEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.reload();
    cy.loginAsUser(SubEstablishment.editUserLoginName, userPassword);
    onHomePage.clickTab('Training and qualifications');
  });

  runTestsForTrainingAndQualsTab(SubEstablishment);
});
