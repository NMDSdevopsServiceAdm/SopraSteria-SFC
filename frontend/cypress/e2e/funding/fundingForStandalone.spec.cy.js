import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onFundingWorkplacePage } from '../../support/page_objects/onFundingPage';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';

describe('Funding page', () => {
  const testWorkplace = StandAloneEstablishment;
  const testWorker = 'Worker to test funding page';

  before(() => {
    cy.clearWorkplaceWDFAnswers(testWorkplace.id);
    cy.changeWorkplaceWDFAnswersTimestamp(testWorkplace.id, '2017-01-01 00:00:00');
    cy.insertTestWorker({
      establishmentID: testWorkplace.id,
      workerName: testWorker,
    });
    cy.reload();
  });

  after(() => {
    cy.deleteTestWorkerFromDb(testWorker);
  });

  describe('main page', () => {
    beforeEach(() => {
      cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));

      cy.url().should('contain', 'dashboard#home');
    });

    it('should contain a link to funding page', () => {
      cy.get('a').contains('Does your data meet funding requirements?').should('be.visible').click();

      cy.get('h1').should('contain.text', 'Does your data meet funding requirements for');
      cy.contains(`(Workplace ID: ${testWorkplace.nmdsId})`).should('be.visible');
      cy.contains(testWorkplace.name).should('be.visible');
    });

    it('should show the correct financial year in funding page heading (on or after 1/Apr)', () => {
      patchWdfDate({
        timestamp: '2027-10-06T13:39:15.271Z',
        effectiveFrom: '2027-04-01T00:00:00.000Z',
      });

      cy.get('a').contains('Does your data meet funding requirements?').click();
      cy.get('h1').should('contain.text', 'Does your data meet funding requirements for 2027 to 2028?');
    });

    it('should show the correct financial year in funding page heading (before 1/Apr)', () => {
      patchWdfDate({
        timestamp: '2031-03-06T13:39:15.271Z',
        effectiveFrom: '2030-04-01T00:00:00.000Z',
      });

      cy.get('a').contains('Does your data meet funding requirements?').click();
      cy.get('h1').should('contain.text', 'Does your data meet funding requirements for 2030 to 2031?');
    });
  });

  describe('answer for workplace', () => {
    beforeEach(() => {
      cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));

      cy.url().should('contain', 'dashboard#home');
      cy.get('a').contains('Does your data meet funding requirements?').click();
    });

    it('should show warning when some workplace answer are not eligible', () => {
      cy.get('div[data-testid="workplace-row"]').as('workplaceRow');
      cy.get('@workplaceRow').within(() => {
        cy.get('img').invoke('attr', 'src').should('include', 'red-flag');
        cy.get('a').contains('Your data does not meet the funding requirements for').should('be.visible').click();
      });

      // on workplace page
      cy.get('h1').contains('Your data').should('be.visible');
      onWorkplacePage.expectRow('numberOfStaff').toHaveValue(0);

      onFundingWorkplacePage.expectRow('numberOfStaff').toHaveWarningMessage("You've 1 more staff record than staff.");

      onFundingWorkplacePage.expectRow('mainService').toHaveWarningMessage('Is this still correct?');

      onFundingWorkplacePage.expectRow('serviceCapacity').toHaveWarningMessage('Add the capacity of your main service');

      ['serviceUsers', 'vacancies', 'starters', 'leavers'].forEach((rowTestid) => {
        onFundingWorkplacePage.expectRow(rowTestid).toHaveWarningMessage('Add this information');
      });
    });

    it.only('should allow user to update their answers', () => {
      cy.get('div[data-testid="workplace-row"]').as('workplaceRow');
      cy.get('@workplaceRow').within(() => {
        cy.get('a').contains('Your data does not meet the funding requirements for').should('be.visible').click();
      });

      onFundingWorkplacePage.clickIntoQuestion('numberOfStaff');
      cy.getByLabel('Number of staff').clear();
      cy.getByLabel('Number of staff').type(1);
      cy.get('button').contains('Save and return').click();

      onFundingWorkplacePage.expectRow('numberOfStaff').toHaveValue('1');
      onFundingWorkplacePage.expectRow('numberOfStaff').notToHaveWarning();

      onFundingWorkplacePage.answerMainServiceQuestion('Day care and day services');
      onFundingWorkplacePage.expectRow('mainService').notToHaveWarning();

      onFundingWorkplacePage.answerServiceCapacity(10, 5);
      onFundingWorkplacePage.expectRow('serviceCapacity').notToHaveWarning();

      onFundingWorkplacePage.answerServiceUsersQuestion();
      onFundingWorkplacePage.expectRow('serviceUsers').notToHaveWarning();
      // ['serviceUsers', 'vacancies', 'starters', 'leavers'].forEach((rowTestid) => {
      //   onFundingWorkplacePage.expectRow(rowTestid).toHaveWarningMessage('Add this information');
      // });
    });
  });

  const patchWdfDate = (overrides) => {
    cy.intercept('GET', '/api/reports/wdf/establishment/*', (req) => {
      req.continue((res) => {
        const patchedResponseBody = {
          ...res.body,
          ...overrides,
        };
        res.body = patchedResponseBody;
      });
    });
  };
});
