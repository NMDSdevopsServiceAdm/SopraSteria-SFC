import { CWPAwarenessAnswers, CWPUseReasons } from '../../support/careWorkforcePathwayData';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { answerCWPAwarenessQuestion, answerCWPUseQuestion } from '../../support/page_objects/workplaceQuestionPages';

const establishmentID = StandAloneEstablishment.id;
const cwpWorkersSummaryPath = 'care-workforce-pathway-workers-summary';
const homePagePath = 'dashboard#home';
const testWorkers = ['test CWP worker 1', 'test CWP worker 2'];

describe('Care workforce pathway journey', { tags: '@others' }, () => {
  before(() => {
    cy.archiveAllWorkersInWorkplace(establishmentID);
    cy.resetWorkplaceCWPAnswers(establishmentID);
  });

  afterEach(() => {
    testWorkers.forEach((workerName) => {
      cy.deleteTestWorkerFromDb(workerName);
    });
    cy.resetWorkplaceCWPAnswers(establishmentID);
  });

  describe('answer Care Workforce Pathway workplace awareness and usage from homepage panel', () => {
    beforeEach(() => {
      cy.reload();
      cy.intercept(
        'GET',
        '/api/establishment/*/careWorkforcePathway/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer',
      ).as('careWorkforcePathway');

      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

      cy.url().should('contain', 'dashboard');
    });
    const cwpAwarenessFlagMessage = 'How aware of the CWP is your workplace?';

    it('should show a flag in homepage summary panel if workplace has not answered the CWP awareness question', () => {
      cy.get('[data-testid="summaryBox"]').should('contain', cwpAwarenessFlagMessage);
    });

    it('the flag should direct user to the CWP awareness question page to answer the questions (is aware of CWP)', () => {
      const reasonsToSelect = CWPUseReasons.filter((reason) => [1, 3, 6, 9].includes(reason.id));

      cy.get('[data-testid="summaryBox"]').contains(cwpAwarenessFlagMessage).click();

      answerCWPAwarenessQuestion(CWPAwarenessAnswers[0]);
      answerCWPUseQuestion('Yes', reasonsToSelect);

      cy.url().should('contain', homePagePath);
      cy.get('app-alert span').should('contain', "Care workforce pathway information saved in 'Workplace'");
      cy.get('[data-testid="summaryBox"]').should('not.contain', cwpAwarenessFlagMessage);

      // verify that workplace summary got the answers
      cy.get('a').contains('Workplace').click();
      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue(CWPAwarenessAnswers[0].textForSummary);
      onWorkplacePage
        .expectRow('care-workforce-pathway-use')
        .toHaveMultipleValues(reasonsToSelect.map((reason) => reason.text));
    });

    it('the flag should direct user to the CWP awareness question page to answer the questions (not aware of CWP)', () => {
      cy.get('[data-testid="summaryBox"]').contains(cwpAwarenessFlagMessage).click();

      answerCWPAwarenessQuestion(CWPAwarenessAnswers[3]);

      cy.url().should('contain', homePagePath);
      cy.get('app-alert span').should('contain', "Care workforce pathway information saved in 'Workplace'");
      cy.get('[data-testid="summaryBox"]').should('not.contain', cwpAwarenessFlagMessage);

      // verify that workplace summary got the answers
      cy.get('a').contains('Workplace').click();
      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue(CWPAwarenessAnswers[3].textForSummary);
      onWorkplacePage.expectRow('care-workforce-pathway-use').notExist();
    });

    it('backlink should work properly when visiting CWP question pages from the flag', () => {
      cy.get('[data-testid="summaryBox"]').contains(cwpAwarenessFlagMessage).click();

      answerCWPAwarenessQuestion(CWPAwarenessAnswers[0]);
      cy.get('h1').should('contain', 'Is your workplace using the care workforce pathway?');

      cy.get('a').contains('Back').click();
      cy.get('h1').should('contain', 'How aware of the care workforce pathway is your workplace?');

      cy.get('a').contains('Back').click();
      cy.url().should('contain', homePagePath);
    });

    it('should clear the flag when user has visited the CWP awareness question page, even if they didnt answer', () => {
      cy.get('[data-testid="summaryBox"]').contains(cwpAwarenessFlagMessage).click();

      cy.get('h1').should('contain', 'How aware of the care workforce pathway is your workplace?');
      cy.get('a').contains('Back').click();

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').should('not.contain', cwpAwarenessFlagMessage);
    });
  });

  describe('answer role category for workers from homepage panel', () => {
    beforeEach(() => {
      cy.insertTestWorker({ establishmentID, workerName: testWorkers[0] });
      cy.insertTestWorker({ establishmentID, workerName: testWorkers[1] });
      cy.reload();

      cy.intercept(
        'GET',
        '/api/establishment/*/careWorkforcePathway/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer',
      ).as('careWorkforcePathway');
      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

      cy.wait('@careWorkforcePathway');

      cy.url().should('contain', homePagePath);
    });

    it('should show a flag in homepage summary panel if some workers have not got the answer for CWP questions', () => {
      cy.get('[data-testid="summaryBox"]').should('contain', 'Where are your staff on the care workforce pathway?');
    });

    it('the flag should direct user to a summary page, which allows them to answer the CWP question for each worker', () => {
      visitCWPWorkersSummaryPage();
      expectCWPWorkersSummaryPageToHaveWorkers(testWorkers);

      answerCWPRoleCategoryForWorker(testWorkers[0], 'New to care');

      // should return user to the CWP worker summary page and show an alert.
      cy.url().should('contain', cwpWorkersSummaryPath);
      cy.get('app-alert span').should('contain', 'Role category saved');
      expectCWPWorkersSummaryPageToHaveWorkers([testWorkers[1]]);

      answerCWPRoleCategoryForWorker(testWorkers[1], 'Practice leader');

      // should return user to homepage and show an alert. also the flag should disappear from summary box
      cy.url().should('contain', homePagePath);
      cy.get('app-alert span').should('contain', 'Role category saved');
      cy.get('[data-testid="summaryBox"]').should('not.contain', 'Where are your staff on the care workforce pathway?');

      expectWorkerToHaveCWPRoleCategory(testWorkers[0], 'New to care');
      expectWorkerToHaveCWPRoleCategory(testWorkers[1], 'Practice leader');
    });
  });
});

const visitCWPWorkersSummaryPage = () => {
  cy.get('a').contains('Where are your staff on the care workforce pathway?').click();
  cy.url().should('contain', cwpWorkersSummaryPath);
  cy.get('h1').should('contain', 'Where are your staff on the care workforce pathway?');
};

const expectCWPWorkersSummaryPageToHaveWorkers = (workerNames) => {
  cy.get('a:contains("Choose a category")').should('have.length', workerNames.length);
  workerNames.forEach((workerName, index) => {
    cy.get(`[data-testid="worker-row-${index}"]`).should('contain', workerName).and('contain', 'Choose a category');
  });
};

const expectWorkerToHaveCWPRoleCategory = (workerName, cwpRoleCategory) => {
  cy.get('a').contains('Staff records').click();
  cy.get('a').contains(workerName).click();
  cy.get('h1').should('contain', 'Staff record');
  cy.get('div').contains('Care workforce pathway role category').parent().should('contain', cwpRoleCategory);
};

const answerCWPRoleCategoryForWorker = (workerName, cwpRoleCategory) => {
  cy.contains(workerName).parents().get('a').contains('Choose a category').click();
  cy.get('h1').should('contain', 'Where are your staff on the care workforce pathway?');
  cy.getByLabel(cwpRoleCategory).check();
  cy.get('button').contains('Save').click();
};
