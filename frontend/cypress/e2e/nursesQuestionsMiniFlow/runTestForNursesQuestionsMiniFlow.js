/* eslint-disable no-undef */

import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';

export const runTestsForNursesQuestionsMiniFlow = (mockEstablishmentData) => {
  const establishmentId = mockEstablishmentData.id;

  const nursesQuestionsFlagMessage = "Review and confirm your nurses' NMC fields of practice";

  const testNurseNames = ['Test Registered Nurse 1', 'Test Registered Nurse 2'];

  const assertNurseQuestionUpdateBannerNotShowing = () => {
    cy.get('app-summary-section').then((summaryPanel) => {
      if (summaryPanel.find('[data-testid="update-banner-area"]').length > 0) {
        cy.get('[data-testid="update-banner-area"]').should('not.contain', nursesQuestionsFlagMessage);
      }
    });
  };

  const expectWorkerToHaveNurseAnswers = (workerName, nurseAnswers) => {
    cy.get('a').contains('Staff records').click();
    cy.get('a').contains(workerName).click();
    cy.get('h1').should('contain', 'Staff record');

    cy.get('div').contains('Nursing and Midwifery Council category').parent().as('nurseQuestionRow');

    nurseAnswers.forEach((answer, index) => {
      if (index > 0) {
        // to delete this early return when worker summary can show multiple answers
        return;
      }

      cy.get('@nurseQuestionRow').should('contain', answer);
    });
  };

  describe("answer nurses' NMC fields of practice questions from homepage panel", () => {
    before(() => {
      cy.resetNursesQuestionForWorkplace(establishmentId);
      cy.setPayAndPensionsMiniFlowViewed(establishmentId);
      cy.setWorkplaceCWPAwarenessQuestionViewed(establishmentId);
      cy.setWorkplaceDHAAnswers(establishmentId, { staffDoDelegatedHealthcareActivities: 'Yes' });
      cy.archiveAllWorkersInWorkplace(establishmentId);
    });

    beforeEach(() => {
      cy.archiveAllWorkersInWorkplace(establishmentId);
      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: testNurseNames[0],
        mainJobFKValue: '23',
      });

      cy.resetNursesQuestionForWorkplace(establishmentId);
      cy.reload();
    });

    it('should direct the user to the nurse questions for a single registered nurse', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.url().should('contain', 'staff-record-summary/nursing-category-from-blue-banner');

      cy.get('h1').should('contain', 'What is their Nursing and Midwifery Council field of practice?');

      cy.contains(testNurseNames[0]).should('be.visible');

      const answersToTick = ['Adult nursing', 'Mental health nursing'];
      cy.getByLabel(answersToTick[0]).click();
      cy.getByLabel(answersToTick[1]).click();

      cy.get('button').contains('Save and return').click();

      cy.get('app-alert').contains('NMC fields of practice confirmed').should('be.visible');

      assertNurseQuestionUpdateBannerNotShowing();

      expectWorkerToHaveNurseAnswers(testNurseNames[0], answersToTick);
    });

    it('should direct the user to a special review and confirm page when there is more than one registered nurse', () => {
      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: testNurseNames[1],
        mainJobFKValue: '23',
      });

      cy.reload();

      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.url().should('contain', 'review-and-confirm-nurse-field-of-practice');

      cy.get('h1').should(
        'contain',
        "Review and confirm these nurses' Nursing and Midwifery Council fields of practice",
      );

      const answersToTick = [
        ['Adult nursing', 'Learning disabilities nursing'], // nurse A
        ['Mental health nursing', "Children's nursing"], // nurse B
      ];

      testNurseNames.forEach((nurseName, index) => {
        cy.contains('[role="row"]', nurseName).as('row');
        cy.get('@row').within(() => {
          cy.contains('Add details').click();
          answersToTick[index].forEach((answer) => {
            cy.getByLabel(answer).click();
          });
        });
      });

      cy.get('button').contains('Confirm all details').click();

      cy.get('app-alert').contains('NMC fields of practice confirmed').should('be.visible');

      assertNurseQuestionUpdateBannerNotShowing();

      expectWorkerToHaveNurseAnswers(testNurseNames[0], answersToTick[0]);
      expectWorkerToHaveNurseAnswers(testNurseNames[1], answersToTick[1]);
    });

    it('should return to the home tab from the nursing questions page', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', nursesQuestionsFlagMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review details').click();

      cy.get('a').contains('Back').click();

      const isParentViewSub = establishmentId === SubEstablishmentNotDataOwner.id;
      const expectedPath = isParentViewSub ? '/subsidiary' : '/dashboard#home';
      cy.url().should('contain', expectedPath);
    });

    it('should not show the flag when there are no registered nurses', () => {
      cy.deleteTestWorkerFromDb(testNurseNames[0]);

      cy.reload();

      assertNurseQuestionUpdateBannerNotShowing();
    });
  });
};
