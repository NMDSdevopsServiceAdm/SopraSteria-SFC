/* eslint-disable no-undef */
/// <reference types="cypress" />

const { SubEstablishmentNotDataOwner } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');
import { userPassword } from '../../support/configData';

describe(
  'Sub training and quals page as edit user where parent owns the data',
  { tags: '@trainingAndQualifications' },
  () => {
    const workerName = 'test worker for training & quals';
    const establishmentID = SubEstablishmentNotDataOwner.id;

    before(() => {
      cy.insertTestWorker({ establishmentID, workerName });
    });

    after(() => {
      cy.deleteTestWorkerFromDb(workerName);
    });

    beforeEach(() => {
      cy.loginAsUser(SubEstablishmentNotDataOwner.editUserLoginName, userPassword);
      onHomePage.clickTab('Training and qualifications');
    });

    it('should show the training and qualifications page', () => {
      cy.get('[data-testid="trainingLinkPanel"]').should('exist');
      cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
    });
  },
);
