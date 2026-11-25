/* eslint-disable no-undef */
/// <reference types="cypress" />

const { ParentEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');
import { userPassword } from '../../support/configData';
import { runTestsForTrainingAndQualsTab } from './runTestsForTrainingAndQualsTab.spec';

describe('Parent training and quals page as edit user', { tags: '@trainingAndQualifications' }, () => {
  const workerName = 'test worker for training & quals';
  const establishmentID = ParentEstablishment.id;

  before(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: ParentEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
    cy.insertTestWorker({ establishmentID, workerName });
    cy.addWorkerTraining({ establishmentID: ParentEstablishment.id, workerName: workerName, categoryId: 4 });
  });

  after(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID: ParentEstablishment.id, workerName: workerName });
    cy.deleteTestWorkerFromDb(workerName);
  });

  beforeEach(() => {
    cy.reload();
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);
    onHomePage.clickTab('Training and qualifications');
  });

  runTestsForTrainingAndQualsTab(ParentEstablishment);
});
