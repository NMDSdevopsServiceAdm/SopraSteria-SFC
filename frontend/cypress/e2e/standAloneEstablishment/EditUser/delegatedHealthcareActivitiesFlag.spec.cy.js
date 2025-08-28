import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import * as lodash from 'lodash';
import { onStaffRecordsPage, onStaffRecordSummaryPage } from '../../../support/page_objects/onStaffRecordsPage';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Delegated Healthcare Activities journey', () => {
  const establishmentId = StandAloneEstablishment.id;
  const loginUsername = Cypress.env('editStandAloneUser');
  const loginPassword = Cypress.env('userPassword');
  const homePagePath = 'dashboard#home';

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
          careWorkforcePathwayRoleCategoryFK: '1',
        });
      });

      cy.loginAsUser(loginUsername, loginPassword);
      cy.url().should('contain', homePagePath);
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

      cy.url().should('contain', homePagePath);

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

    it('the question page should only list workers that does not have answer for DHA question', () => {
      const alreadyAnswered = testWorkerNames.filter((_, index) => index % 2 === 0);
      const notYetAnswered = testWorkerNames.filter((_, index) => index % 2 === 1);

      // fill in answer for each worker
      alreadyAnswered.forEach((workerName) => {
        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(workerName);
        onStaffRecordSummaryPage.clickIntoQuestion('Carries out delegated healthcare activities');
        onStaffRecordSummaryPage.answerDHAQuestion('No');
      });

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

    it.skip('the question page should only list workers that have a relevant main job role', () => {});

    it.skip('backlink should work properly when visiting the question page from the flag', () => {});

    it.skip('should clear the flag if every worker has got answer for DHA question', () => {});

    it.skip('should show the flag as long as some worker has not got the answer for DHA question', () => {});
  });
});
