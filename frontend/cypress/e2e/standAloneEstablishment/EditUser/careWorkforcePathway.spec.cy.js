import { CWPAwarenessAnswers, CWPUseReasons } from '../../../support/careWorkforcePathwayData';
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../../support/page_objects/onWorkplacePage';

const establishmentID = StandAloneEstablishment.id;
const cwpWorkersSummaryPath = 'care-workforce-pathway-workers-summary';
const homePagePath = 'dashboard#home';
const testWorkers = ['test CWP worker 1', 'test CWP worker 2'];

describe('Care workforce pathway journey', () => {
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
    const flagMessage = 'How aware of the CWP is your workplace?';

    it('should show a flag in homepage summary panel if workplace has not answered the CWP awareness question', () => {
      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').should('contain', flagMessage);
    });

    it('the flag should direct user to the CWP awareness question page to answer the questions', () => {
      const reasonsToSelect = CWPUseReasons.filter((reason) => [1, 3, 6, 9].includes(reason.id));

      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').contains(flagMessage).click();

      // answer CWP awareness question
      cy.get('h1').should('contain', 'How aware of the care workforce pathway is your workplace?');
      cy.getByLabel(CWPAwarenessAnswers[0].title).click();
      cy.get('button').contains('Save').click();

      // answer CWP use question
      cy.get('h1').should('contain', 'Is your workplace using the care workforce pathway?');
      cy.getByLabel(/Yes/).click();
      reasonsToSelect.forEach((reason) => {
        cy.getByLabel(reason.text).click();
      });
      cy.get('button').contains('Save and return').click();

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').should('not.contain', flagMessage);

      // verify that workplace summary got the answers
      cy.get('a').contains('Workplace').click();
      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue(CWPAwarenessAnswers[0].textForSummary);
      onWorkplacePage
        .expectRow('care-workforce-pathway-use')
        .toHaveMultipleValues(reasonsToSelect.map((reason) => reason.text));
    });

    it('the flag should disappear when user has visit the CWP awareness question page, even if they didnt answer', () => {
      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').contains(flagMessage).click();

      cy.get('h1').should('contain', 'How aware of the care workforce pathway is your workplace?');
      cy.get('a').contains('Back').click();

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').should('not.contain', flagMessage);
    });
  });

  describe('answer role category for workers from homepage panel', () => {
    it('should show a flag in homepage summary panel if some workers have not got the answer for CWP questions', () => {
      cy.insertTestWorker({ establishmentID, workerName: testWorkers[0] });

      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

      cy.url().should('contain', homePagePath);
      cy.get('[data-testid="summaryBox"]').should('contain', 'Where are your staff on the care workforce pathway?');
    });

    it('the flag should direct user to a summary page, which allows them to answer the CWP question for each worker', () => {
      cy.insertTestWorker({ establishmentID, workerName: testWorkers[0] });
      cy.insertTestWorker({ establishmentID, workerName: testWorkers[1] });

      cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));

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
