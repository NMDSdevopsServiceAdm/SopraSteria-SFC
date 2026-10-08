/* eslint-disable no-undef */
import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';


export const runTestsForCWPRoleCategories = (mockEstablishmentData) => {
  const establishmentId = mockEstablishmentData.id;

  const bannerMessage = 'The full list of care workforce pathway role categories is now available.';

  const assertBannerNotShowing = () => {
    onHomePage.assertUpdateBannerNotShowing(bannerMessage);
  };

  describe('CWP role categories blue banner', () => {
    before(() => {
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

    afterEach(() => {
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
      cy.get('[data-testid="update-banner-area"]').contains('Review records').click();

      cy.go('back');

      assertBannerNotShowing();

      cy.reload();

      assertBannerNotShowing();
    });

    it('should not show the banner when already viewed', () => {
      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId, true);
      cy.reload();

      assertBannerNotShowing();
    });
  });
};
