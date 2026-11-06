/* eslint-disable no-undef */
import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

const bannerMessage = 'The full list of Care Workforce Pathway role categories is now available.';
const alertBannerMessage = 'Care Workforce Pathway role categories reviewed';
const staffRecordsTabLinkText = 'Check your staff Care Workforce Pathway role categories';

const cwpWorkersSummaryPath = 'care-workforce-pathway-workers-summary';
const cwpReviewNewToCarePath = 'review-new-to-care';

SubEstablishmentNotDataOwner;

export const runTestsForCWPRoleCategories = (mockEstablishmentData) => {
  const establishmentId = mockEstablishmentData.id;

  const testWorkers = [1, 2, 3].map((i) => `CWP banner test worker ${i} ${establishmentId}`);

  const jobRoleExcluded = [
    ['Registered nurse', '23'],
    ['Occupational therapist', '18'],
    ['Social worker', '27'],
  ];
  const testWorkersExcludedFromCWP = jobRoleExcluded.map(
    ([title, jobId]) => `CWP banner test worker ${title} ${establishmentId}`,
  );

  const assertBannerNotShowing = () => {
    onHomePage.assertUpdateBannerNotShowing(bannerMessage);
  };

  const homeTabUrl =
    mockEstablishmentData === SubEstablishmentNotDataOwner
      ? `/subsidiary/${SubEstablishmentNotDataOwner.uid}/home`
      : '/dashboard#home';

  const staffRecordsTabUrl =
    mockEstablishmentData === SubEstablishmentNotDataOwner
      ? `/subsidiary/${SubEstablishmentNotDataOwner.uid}/staff-records`
      : '/dashboard#staff-records';

  describe('CWP role categories blue banner', () => {
    before(() => {
      cy.archiveAllWorkersInWorkplace(establishmentId);

      testWorkers.forEach((workerName) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          mainJobFKValue: '10',
          careWorkforcePathwayRoleCategoryFK: null,
        });
      });

      testWorkersExcludedFromCWP.forEach((workerName, index) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          mainJobFKValue: jobRoleExcluded[index][1],
          careWorkforcePathwayRoleCategoryFK: null,
        });
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
      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId);
    });

    it('should show the CWP role categories banner which lead to the CWP workers summary page', () => {
      cy.get('[data-testid="update-banner-area"]').should('contain', bannerMessage);

      cy.get('[data-testid="update-banner-area"]').contains('Review records').click();

      cy.url().should('contain', cwpWorkersSummaryPath);
    });

    it('should allow user to answer the CWP question for each worker', () => {
      visitCWPWorkersSummaryPageFromBlueBanner();
      expectCWPWorkersSummaryPageToHaveWorkers(testWorkers);

      answerCWPRoleCategoryForWorker(testWorkers[0], 'New to care');
      answerCWPRoleCategoryForWorker(testWorkers[1], 'Practice leader');
      answerCWPRoleCategoryForWorker(testWorkers[2], 'None of these categories');

      cy.contains('button', 'Confirm role categories').click();

      // should skip the review new to care page
      cy.url().should('contain', homeTabUrl);
      cy.get('[data-testid="update-banner-area"]').should('not.contain', bannerMessage);
      cy.get('app-alert span').should('contain', alertBannerMessage);

      expectWorkerToHaveCWPRoleCategory(testWorkers[0], 'New to care');
      expectWorkerToHaveCWPRoleCategory(testWorkers[1], 'Practice leader');
      expectWorkerToHaveCWPRoleCategory(testWorkers[2], 'None of these categories');
    });

    it('should not show the banner when already viewed', () => {
      cy.intercept('POST', '**/updateSingleEstablishmentField').as('updateBannerViewed');
      cy.get('[data-testid="update-banner-area"]').contains('Review records').click();
      cy.wait('@updateBannerViewed');

      cy.url().should('contain', 'care-workforce-pathway-workers-summary');
      cy.get('a').contains('Back').click();

      assertBannerNotShowing();

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

  describe('CWP role categories journey from perm link', () => {
    before(() => {
      cy.archiveAllWorkersInWorkplace(establishmentId);

      testWorkers.forEach((workerName) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          mainJobFKValue: '10',
          careWorkforcePathwayRoleCategoryFK: null,
        });
      });

      testWorkersExcludedFromCWP.forEach((workerName, index) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          mainJobFKValue: jobRoleExcluded[index][1],
          careWorkforcePathwayRoleCategoryFK: null,
        });
      });
    });

    it('should be able to complete the CWP workers summary journey from the link in staff records tab', () => {
      onHomePage.clickTab('Staff records');
      cy.get('a').contains(staffRecordsTabLinkText).click();

      expectCWPWorkersSummaryPageToHaveWorkers(testWorkers);

      answerCWPRoleCategoryForWorker(testWorkers[0], 'Domestic');
      answerCWPRoleCategoryForWorker(testWorkers[1], 'Supervisor or leader');
      answerCWPRoleCategoryForWorker(testWorkers[2], 'I do not know');

      cy.url().should('contain', cwpWorkersSummaryPath);
      cy.contains('button', 'Confirm role categories').click();

      cy.url().should('contain', staffRecordsTabUrl);
      cy.get('app-alert span').should('contain', alertBannerMessage);

      expectWorkerToHaveCWPRoleCategory(testWorkers[0], 'Domestic');
      expectWorkerToHaveCWPRoleCategory(testWorkers[1], 'Supervisor or leader');
      expectWorkerToHaveCWPRoleCategory(testWorkers[2], 'Not known');
    });
  });

  describe('Review New to care page', () => {
    before(() => {
      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId);
    });

    beforeEach(() => {
      const nDaysBeforeToday = (days) => {
        const today = new Date();
        let newDate = new Date();
        newDate.setDate(today.getDate() - days);
        return newDate.toISOString();
      };

      cy.archiveAllWorkersInWorkplace(establishmentId);
      cy.resetCWPRoleCategoriesBannerForWorkplace(establishmentId);

      [testWorkers[0], testWorkers[1]].forEach((workerName) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          mainJobFKValue: '10',
          careWorkforcePathwayRoleCategoryFK: 1,
        });
      });

      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: testWorkers[2],
        mainJobFKValue: '10',
        careWorkforcePathwayRoleCategoryFK: 1,
        MainJobStartDateValue: nDaysBeforeToday(366),
      });

      cy.insertTestWorker({
        establishmentID: establishmentId,
        workerName: 'test worker start date within 1 year',
        mainJobFKValue: '10',
        careWorkforcePathwayRoleCategoryFK: 1,
        MainJobStartDateValue: nDaysBeforeToday(364),
      });

      testWorkersExcludedFromCWP.forEach((workerName, index) => {
        cy.insertTestWorker({
          establishmentID: establishmentId,
          workerName,
          mainJobFKValue: jobRoleExcluded[index][1],
          careWorkforcePathwayRoleCategoryFK: 1,
        });
      });
    });
    const fromReviewNewToCarePage = true;

    const testCases = [
      {
        name: 'blue banner',
        visitCWPWorkersSummaryPage: visitCWPWorkersSummaryPageFromBlueBanner,
        expectedReturnUrl: homeTabUrl,
      },
      {
        name: 'staff records link',
        visitCWPWorkersSummaryPage: visitCWPWorkersSummaryPageFromStaffRecordsLink,
        expectedReturnUrl: staffRecordsTabUrl,
      },
    ];

    testCases.forEach((testcase) => {
      const { name, visitCWPWorkersSummaryPage, expectedReturnUrl } = testcase;

      it(`should be able to complete Review New to care journey from ${name}`, () => {
        visitCWPWorkersSummaryPage();

        cy.contains('button', 'Confirm role categories').click();

        cy.url().should('contain', cwpReviewNewToCarePath);
        cy.get('h1').should('contain', "Review whether these staff are still 'New to care'");

        cy.contains('test worker start date within 1 year').should('not.exist');
        testWorkersExcludedFromCWP.forEach((workerName) => {
          cy.contains(workerName).should('not.exist');
        });

        answerCWPRoleCategoryForWorker(testWorkers[0], 'Practice leader', fromReviewNewToCarePage);
        cy.url().should('contain', cwpReviewNewToCarePath);
        cy.contains(testWorkers[0]).should('not.exist');

        answerCWPRoleCategoryForWorker(testWorkers[1], 'Supervisor or leader', fromReviewNewToCarePage);
        cy.url().should('contain', cwpReviewNewToCarePath);
        cy.contains(testWorkers[1]).should('not.exist');

        answerCWPRoleCategoryForWorker(testWorkers[2], 'None of these categories', fromReviewNewToCarePage);

        // should return to home tab / staff records tab directly after answering last worker
        cy.url().should('contain', expectedReturnUrl);
        cy.get('app-alert span').should('contain', alertBannerMessage);

        expectWorkerToHaveCWPRoleCategory(testWorkers[0], 'Practice leader');
        expectWorkerToHaveCWPRoleCategory(testWorkers[1], 'Supervisor or leader');
        expectWorkerToHaveCWPRoleCategory(testWorkers[2], 'None of these categories');
      });
    });

    it(`should temporarily hide a worker if user save without changing`, () => {
      cy.reload();
      visitCWPWorkersSummaryPageFromBlueBanner();

      cy.contains('button', 'Confirm role categories').click();

      cy.url().should('contain', cwpReviewNewToCarePath);
      cy.get('h1').should('contain', "Review whether these staff are still 'New to care'");

      // click into worker1 and save without changing
      cy.contains('tr', testWorkers[1]).find('a').contains('Change').click();
      cy.get('h1').should('contain', 'Where are they currently on the Care Workforce Pathway?');
      cy.contains(testWorkers[1]).should('be.visible');
      cy.get('button').contains('Save').click();

      cy.url().should('contain', cwpReviewNewToCarePath);
      cy.contains(testWorkers[1]).should('not.exist');
      cy.contains(testWorkers[0]).should('be.visible');
      cy.contains(testWorkers[2]).should('be.visible');

      cy.get('button').contains('Return to home').click();

      cy.url().should('contain', homeTabUrl);
      cy.get('app-alert span').should('contain', alertBannerMessage);

      visitCWPWorkersSummaryPageFromStaffRecordsLink();
      cy.contains(testWorkers[1]).should('exist');
    });
  });
};

const visitCWPWorkersSummaryPageFromBlueBanner = () => {
  cy.get('[data-testid="update-banner-area"]').should('contain', bannerMessage);
  cy.get('[data-testid="update-banner-area"]').contains('Review records').click();
  cy.url().should('contain', cwpWorkersSummaryPath);
  cy.get('h1').should('contain', 'Where are your staff on the Care Workforce Pathway?');
};

const visitCWPWorkersSummaryPageFromStaffRecordsLink = () => {
  onHomePage.clickTab('Staff records');
  cy.get('a').contains(staffRecordsTabLinkText).click();
};

const expectCWPWorkersSummaryPageToHaveWorkers = (workerNames) => {
  cy.get('a:contains("Check new roles")').should('have.length', workerNames.length);
  workerNames.forEach((workerName, index) => {
    cy.get(`[data-testid="worker-row-${index}"]`).should('contain', workerName).and('contain', 'Check new roles');
  });
};

const expectWorkerToHaveCWPRoleCategory = (workerName, cwpRoleCategory) => {
  cy.get('a').contains('Staff records').click();
  cy.get('a').contains(workerName).click();
  cy.get('h1').should('contain', 'Staff record');
  cy.get('div').contains('Care workforce pathway role category').parent().should('contain', cwpRoleCategory);
};

const answerCWPRoleCategoryForWorker = (workerName, cwpRoleCategory, fromReviewNewToCarePage = false) => {
  const linkText = fromReviewNewToCarePage ? 'Change' : 'Check new roles';

  cy.contains('tr', workerName).find('a').contains(linkText).click();
  cy.get('h1').should('contain', 'Where are they currently on the Care Workforce Pathway?');

  cy.contains(workerName).should('be.visible');

  cy.getByLabel(cwpRoleCategory).check();
  cy.get('button').contains('Save').click();
};
