/* eslint-disable no-undef */

import { onHomePage } from '../../support/page_objects/onHomePage';
import { onStaffRecordsPage } from '../../support/page_objects/onStaffRecordsPage';
import { onStaffRecordSummaryPage } from '../../support/page_objects/onStaffRecordSummaryPage';

export const runTestsForNursesQuestionsMiniFlow = (mockEstablishmentData) => {
  const { id: establishmentId } = mockEstablishmentData;

  const nursesQuestionsFlagMessage = "Review and confirm your nurses' NMC fields of practice";

  const testNurseNames = ['Test Registered Nurse 1', 'Test Registered Nurse 2'];

  describe("answer nurses' NMC fields of practice questions from homepage panel", () => {
    before(() => {
      cy.archiveAllWorkersInWorkplace(establishmentId);
    });

    beforeEach(() => {
      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: testNurseNames[0],
        mainJobFKValue: '23',
      });

      cy.resetNursesQuestionsWorkplace(establishmentId);
      cy.reload();
    });

    afterEach(() => {
      testNurseNames.forEach((workerName) => {
        cy.deleteTestWorkerFromDb(workerName);
      });

      cy.resetNursesQuestionsWorkplace(establishmentId);
    });

    it('should show an update banner for nurses questions in the homepage summary panel', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);
    });

    it('should direct the user to the nurse questions for a single registered nurse', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.url().should('contain', 'staff-record-summary/nursing-category');

      cy.get('h1').should('contain', 'Nursing');
    });

    it('should remove the flag after clicking Review details', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.go('back');

      cy.get('[data-testid="update-banner-area"]').should('not.contain', nursesQuestionsFlagMessage);
    });

    //This test needs to be changes after the new page is built

    it('should direct the user to staff records when there is more than one registered nurse', () => {
      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: testNurseNames[1],
        mainJobFKValue: '23',
      });

      cy.reload();

      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.url().should('contain', '/dashboard#staff-records');
    });

    it('should not show the flag when there are no registered nurses', () => {
      cy.deleteTestWorkerFromDb(testNurseNames[0]);

      cy.reload();

      cy.get('[data-testid="update-banner-area"]').should('not.contain', nursesQuestionsFlagMessage);
    });

    it('should return to the home tab from the nursing questions page', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.get('a').contains('Back').click();

      cy.url().should('contain', '/dashboard#home');
    });
  });
};
