/* eslint-disable no-undef */
/// <reference types="cypress" />

import lodash from 'lodash';
import { onStaffRecordsPage, onStaffRecordSummaryPage } from '../../support/page_objects/onStaffRecordsPage';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';

export const runTestsForDHAHomeTabFlag = (mockEstablishmentData) => {
  const { id: establishmentId } = mockEstablishmentData;
  const homePagePathRegex =
    mockEstablishmentData === SubEstablishmentNotDataOwner ? /subsidiary\/.*\/home/ : /dashboard#home/;

  describe('answer Delegated Healthcare Activities worker question from homepage panel', () => {
    const testWorkerNames = lodash.range(1, 6).map((i) => `test DHA worker${i}`);
    const mainServiceThatCanDoDHA = { id: 9, name: 'Day care and day services' };

    const dhaFlagMessage = 'Who carries out delegated healthcare activities?';

    before(() => {
      cy.archiveAllWorkersInWorkplace(establishmentId);
      cy.setWorkplaceMainService(establishmentId, mainServiceThatCanDoDHA.id);
      cy.resetWorkplaceDHAAnswers(establishmentId);
    });

    beforeEach(() => {
      testWorkerNames.forEach((workerName) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          // need to fill this value for test workers as CWP flag take higher precedence than DHA flag
          careWorkforcePathwayRoleCategoryFK: '1',
        });
      });
      cy.reload();
      // onHomePage.clickTab('Home');
    });

    afterEach(() => {
      testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
      cy.resetWorkplaceDHAAnswers(establishmentId);
    });

    it('should show a flag for DHA in homepage summary panel', () => {
      cy.get('[data-testid="staff-records-row"]').should('contain', dhaFlagMessage);
    });

    it('the flag should direct user to a new question page to answer the DHA question for a list of workers', () => {
      const mockAnswersForEachWorker = testWorkerNames.map((_, index) => ['Yes', 'No', 'I do not know'].at(index % 3));

      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).click();

      cy.get('h1').should('contain', 'Who carries out delegated healthcare activities?');

      // fill in answer for each worker
      testWorkerNames.forEach((workerName, index) => {
        const mockAnswer = mockAnswersForEachWorker[index];
        const workerRow = cy.contains('tr.govuk-table__row', workerName);

        workerRow.within(() => cy.getByLabel(mockAnswer).click());
      });

      cy.get('button').contains('Save and return').click();

      cy.url().should('match', homePagePathRegex);
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).should('not.exist');
      cy.get('app-alert span').should('contain', 'Delegated healthcare activity information saved');

      // verify that the staff records are updated
      testWorkerNames.forEach((workerName, index) => {
        const answer = mockAnswersForEachWorker[index];
        const expectedValueInStaffRecordPage = answer === 'I do not know' ? 'Not known' : answer;

        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(workerName);
        onStaffRecordSummaryPage
          .expectRow('Carries out delegated healthcare activities')
          .toHaveValue(expectedValueInStaffRecordPage);
      });
    });

    it(`should show a link in each row to the worker's staff record summary page with the name of worker`, () => {
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).click();

      cy.get('h1').should('contain', 'Who carries out delegated healthcare activities?');

      testWorkerNames.forEach((workerName) => {
        const workerRow = cy.contains('tr.govuk-table__row', workerName);
        workerRow.within(() => cy.get('a').contains(workerName).should('be.visible'));
      });

      cy.get('a').contains(testWorkerNames[0]).click();

      cy.url().should('contain', 'staff-record-summary');
      cy.get('h1').should('contain', 'Staff record');
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorkerNames[0]);
    });

    it('should only show workers that does not have answer for DHA question in the question page', () => {
      const alreadyAnswered = testWorkerNames.filter((_, index) => index % 2 === 0);
      const notYetAnswered = testWorkerNames.filter((_, index) => index % 2 === 1);

      // prepping workers
      alreadyAnswered.forEach((workerName) => {
        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(workerName);
        onStaffRecordSummaryPage.clickIntoQuestion('Carries out delegated healthcare activities');
        onStaffRecordSummaryPage.answerDHAQuestion('No');
      });

      // test starts here
      onHomePage.clickTab('Home');
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).click();

      cy.get('h1').should('contain', 'Who carries out delegated healthcare activities?');

      notYetAnswered.forEach((workerName) => {
        cy.contains('tr.govuk-table__row', workerName).should('be.visible');
      });

      alreadyAnswered.forEach((workerName) => {
        cy.contains('tr.govuk-table__row', workerName).should('not.exist');
      });
    });

    it('should only show workers that have a relevant main job role in the question page', () => {
      const relevantWorkers = [
        {
          workerName: 'Care co-ordinator',
          mainJobFKValue: '8',
        },
        {
          workerName: 'Senior care worker',
          mainJobFKValue: '25',
        },
      ];
      const irrelevantWorkers = [
        {
          workerName: 'Data analyst',
          mainJobFKValue: '33',
        },
        {
          workerName: 'IT manager',
          mainJobFKValue: '36',
        },
      ];

      [...relevantWorkers, ...irrelevantWorkers].forEach(({ workerName, mainJobFKValue }) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          careWorkforcePathwayRoleCategoryFK: '1',
          workerName,
          mainJobFKValue,
        });
      });

      // test starts here
      onHomePage.clickTab('Home');
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).click();

      cy.get('h1').should('contain', 'Who carries out delegated healthcare activities?');

      relevantWorkers.forEach(({ workerName }) => {
        cy.contains('tr.govuk-table__row', workerName).should('be.visible');
      });

      irrelevantWorkers.forEach(({ workerName }) => {
        cy.contains('tr.govuk-table__row', workerName).should('not.exist');
      });

      // clear the test workers
      [...relevantWorkers, ...irrelevantWorkers].forEach(({ workerName }) => {
        cy.deleteTestWorkerFromDb(workerName);
      });
    });

    it('backlink in new question page should bring user back to home tab', () => {
      onHomePage.clickTab('Home');
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).click();

      cy.get('h1').should('contain', 'Who carries out delegated healthcare activities?');

      cy.get('a').contains('Back').click();

      cy.url().should('match', homePagePathRegex);
    });

    it("should keep the flag showing up if haven't got answer for every worker", () => {
      const workersToAnswer = [testWorkerNames[0], testWorkerNames[2]];

      onHomePage.clickTab('Home');
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).click();

      cy.get('h1').should('contain', 'Who carries out delegated healthcare activities?');

      workersToAnswer.forEach((workerName) => {
        const workerRow = cy.contains('tr.govuk-table__row', workerName);
        workerRow.within(() => cy.getByLabel('Yes').click());
      });

      cy.get('button').contains('Save and return').click();

      onHomePage.clickTab('Home');
      cy.get('[data-testid="staff-records-row"]').contains(dhaFlagMessage).should('be.visible');
    });
  });
};
