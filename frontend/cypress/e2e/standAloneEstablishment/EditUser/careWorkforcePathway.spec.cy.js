import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';

const establishmentID = StandAloneEstablishment.id;
const cwpWorkersSummaryPath = 'care-workforce-pathway-workers-summary';
const homePagePath = 'dashboard#home';
const testWorkers = ['test CWP worker 1', 'test CWP worker 2'];

describe('Care workforce pathway journey', () => {
  before(() => {
    cy.archiveAllWorkersInWorkplace(establishmentID);
  });

  afterEach(() => {
    testWorkers.forEach((workerName) => {
      cy.deleteTestWorkerFromDb(workerName);
    });
  });

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
