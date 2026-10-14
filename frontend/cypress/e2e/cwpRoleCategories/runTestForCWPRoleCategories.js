/* eslint-disable no-undef */
import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

export const runTestsForCWPRoleCategories = (mockEstablishmentData) => {
  const establishmentId = mockEstablishmentData.id;
  const testWorkerName = `CWP banner test worker ${establishmentId}`;

  const bannerMessage = 'The full list of Care Workforce Pathway role categories is now available.';

  const assertBannerNotShowing = () => {
    onHomePage.assertUpdateBannerNotShowing(bannerMessage);
  };

  describe('CWP role categories blue banner', () => {
    let originalActiveWorkerIds = [];

    before(() => {
      // Archive existing active workers and save their IDs.
      cy.archiveActiveWorkersForCWPTest(establishmentId).then((result) => {
        originalActiveWorkerIds = result.rows.map((worker) => worker.ID);
      });

      // Create a worker for cwp banner test
      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: testWorkerName,
        mainJobFKValue: '10',
        careWorkforcePathwayRoleCategoryFK: null,
      });

      cy.setPayAndPensionsMiniFlowViewed(establishmentId);
      cy.setWorkplaceCWPAwarenessQuestionViewed(establishmentId);
      cy.setWorkplaceDHAAnswers(establishmentId, {
        staffDoDelegatedHealthcareActivities: 'Yes',
      });
    });

    beforeEach(() => {
      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId);
      cy.reload();
    });

    after(() => {
      // Remove the worker created for this test suite
      cy.deleteTestWorkerFromDb(testWorkerName);

      cy.restoreWorkersForCWPTest(originalActiveWorkerIds);

      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId);
    });

    it('should show the CWP role categories banner', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', bannerMessage);
    });

    it('should navigate to the CWP workers summary page', () => {
      cy.get('[data-testid="update-banner-area"]').contains('Review records').click();

      cy.url().should('contain', 'care-workforce-pathway-workers-summary');
    });

    it('should return to the home tab from the CWP workers summary page', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', bannerMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review records').click();

      cy.url().should('contain', 'care-workforce-pathway-workers-summary');

      cy.get('a').contains('Back').click();

      const isParentViewSub = establishmentId === SubEstablishmentNotDataOwner.id;
      const expectedPath = isParentViewSub ? '/subsidiary' : '/dashboard#home';

      cy.url().should('contain', expectedPath);

      assertBannerNotShowing();
    });

    it('should hide the banner after clicking Review records', () => {
      cy.intercept('POST', '**/updateSingleEstablishmentField').as('updateBannerViewed');

      cy.get('[data-testid="update-banner-area"]').contains('Review records').click();

      cy.wait('@updateBannerViewed');

      cy.url().should('contain', 'care-workforce-pathway-workers-summary');

      cy.get('a').contains('Back').click();

      assertBannerNotShowing();

      cy.reload();

      assertBannerNotShowing();
    });

    it('should not show the banner when already viewed', () => {
      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId, true);

      cy.reload();

      assertBannerNotShowing();
    });

    it('should not show the CWP banner when there are no active staff records', () => {
      // Archive the test worker created
      cy.archiveActiveWorkersForCWPTest(establishmentId);

      cy.reload();

      assertBannerNotShowing();
    });
  });
};
