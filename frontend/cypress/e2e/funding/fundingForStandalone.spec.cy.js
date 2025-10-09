import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { FundingWorkplacePage, onFundingPage, onFundingWorkplacePage } from '../../support/page_objects/onFundingPage';

const getFundingEligibilityStartDate = (today = null) => {
  today = today || new Date();
  const yearStartMonth = 3; // April
  if (today.getMonth() < yearStartMonth) {
    return new Date(Date.UTC(today.getFullYear() - 1, yearStartMonth, 1));
  } else {
    return new Date(Date.UTC(today.getFullYear(), yearStartMonth, 1));
  }
};
const periodStartDate = getFundingEligibilityStartDate();
const yearStart = periodStartDate.getFullYear();
const currentPeriod = `${yearStart} to ${yearStart + 1}`;

const nonEligibleMessage = `Your data does not meet the funding requirements for ${currentPeriod}`;
const eligibleMessage = `Your data has met the funding requirements for ${currentPeriod}`;

describe('Funding page', () => {
  const testWorkplace = StandAloneEstablishment;
  const testWorker = 'Worker to test funding page';

  before(() => {
    cy.clearWorkplaceWDFAnswers(testWorkplace.id);
    cy.changeWorkplaceWDFAnswersTimestamp(testWorkplace.id, '2017-01-01 00:00:00');

    cy.archiveAllWorkersInWorkplace(testWorkplace.id);
    cy.insertTestWorker({
      establishmentID: testWorkplace.id,
      workerName: testWorker,
    });
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

      cy.get('h1').should('contain.text', `Does your data meet funding requirements for ${currentPeriod}`);
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
      cy.get('h1').should('contain.text', `Does your data meet funding requirements for ${currentPeriod}`);
    });

    describe('when answers are all filled in and updated', () => {
      beforeEach(() => {
        cy.clearWorkplaceWDFAnswers(testWorkplace.id);
        cy.insertDummyAnswerForWorkplaceWDFAnswers(testWorkplace.id);
        cy.changeWorkplaceWDFAnswersTimestamp(testWorkplace.id, new Date());
        cy.reload();
      });

      it('should show an eligible message for workplace', () => {
        cy.get('div[data-testid="workplace-row"]').within(() => {
          cy.get('img[src*="green-tick"]').should('be.visible');
          cy.contains(eligibleMessage).should('be.visible');
        });
      });
    });

    describe('when answers are missing', () => {
      before(() => {
        cy.clearWorkplaceWDFAnswers(testWorkplace.id);
        cy.reload();
      });

      it('should show non-eligible message for workplace and warnings for the missing answers', () => {
        cy.get('div[data-testid="workplace-row"]').as('workplaceRow');
        cy.get('@workplaceRow').within(() => {
          cy.get('img[src*="red-flag"]').should('be.visible');
          cy.get('a').contains('Your data does not meet the funding requirements for').should('be.visible').click();
        });

        // skip checking for the rows of numberOfStaff, employerType and mainService,
        // as those are mandatory when creating new workplace

        onFundingWorkplacePage
          .expectRow('serviceCapacity')
          .toHaveWarningMessage('Add the capacity of your main service');

        ['serviceUsers', 'vacancies', 'starters', 'leavers'].forEach((rowTestid) => {
          onFundingWorkplacePage.expectRow(rowTestid).toHaveWarningMessage('Add this information');
        });
      });

      it('should allow user to update their answers', () => {
        cy.get('div[data-testid="workplace-row"]').as('workplaceRow');
        cy.get('@workplaceRow').find('a').contains('Your data does not meet the funding requirements for').click();

        onFundingWorkplacePage.clickIntoQuestion('numberOfStaff');
        onFundingWorkplacePage.answerNumberOfStaffQuestion('1');
        onFundingWorkplacePage.expectRow('numberOfStaff').toHaveValue('1');
        onFundingWorkplacePage.expectRow('numberOfStaff').notToHaveWarning();

        onFundingWorkplacePage.clickIntoQuestion('mainService');
        onFundingWorkplacePage.answerMainServiceQuestion('Day care and day services');
        onFundingWorkplacePage.expectRow('mainService').notToHaveWarning();

        onFundingWorkplacePage.clickIntoQuestion('serviceCapacity');
        onFundingWorkplacePage.answerServiceCapacity(10, 5);
        onFundingWorkplacePage.expectRow('serviceCapacity').notToHaveWarning();

        onFundingWorkplacePage.clickIntoQuestion('serviceUsers');
        onFundingWorkplacePage.answerServiceUsersQuestion();
        onFundingWorkplacePage.expectRow('serviceUsers').notToHaveWarning();

        ['vacancies', 'starters', 'leavers'].forEach((testIdForRow) => {
          onFundingWorkplacePage.clickIntoQuestion(testIdForRow);
          cy.getByLabel(/I do not know/).click();
          cy.get('button').contains(/Save/).click();
          onFundingWorkplacePage.expectRow(testIdForRow).notToHaveWarning();
        });

        onFundingPage.expectWorkplaceRowToShowEligibilityMessage();
      });
    });

    describe('when answers are not updated', () => {
      beforeEach(() => {
        cy.clearWorkplaceWDFAnswers(testWorkplace.id);
        cy.insertDummyAnswerForWorkplaceWDFAnswers(testWorkplace.id);
        cy.changeWorkplaceWDFAnswersTimestamp(testWorkplace.id, '2017-01-01 00:00:00');
        cy.reload();

        cy.url().should('contain', 'funding');
        cy.get('h1').should('contain', `Does your data meet funding requirements for ${currentPeriod}`);
        cy.get('div[data-testid="workplace-row"]').as('workplaceRow');
        cy.get('@workplaceRow').find('a').click();
      });

      it('should show confirmation messages when the answer has not been updated', () => {
        cy.get('@workplaceRow').contains(nonEligibleMessage).should('be.visible');

        FundingWorkplacePage.testIdsForAllFundingRows.forEach((testId) => {
          if (testId === 'employerType') {
            // bypass the check for employerType, as currently WDF page have legacy logic that auto update employerType on page load
            // see wdf-workplace-summary.component.ts, updateEmployerTypeIfNotUpdatedSinceEffectiveDate()
            return;
          }
          onFundingWorkplacePage.expectRowToHaveConfirmationMessage(testId, 'Is this still correct?');
        });
      });

      it('should let user keep previous answer and update by clicking "Yes, it is"', () => {
        cy.get('@workplaceRow').contains(nonEligibleMessage).should('be.visible');

        FundingWorkplacePage.testIdsForAllFundingRows.forEach((testId) => {
          if (testId === 'employerType') {
            // skip employerType as it won't show ConfirmationMessage
            return;
          }

          onFundingWorkplacePage.getConfirmationMessageForRow(testId).find('button').contains('Yes, it is').click();

          onFundingWorkplacePage.getConfirmationMessageForRow(testId).within(() => {
            cy.contains('Meeting requirements').should('be.visible');
            cy.get('img[src*="tick-icon"]').should('be.visible');
          });
        });

        cy.get('@workplaceRow').contains(eligibleMessage).should('be.visible');
      });

      it('should let user change their answer by clicking "No, change it"', () => {
        cy.get('@workplaceRow').contains(nonEligibleMessage).should('be.visible');

        onFundingWorkplacePage
          .getConfirmationMessageForRow('numberOfStaff')
          .find('a')
          .contains('No, change it')
          .click();
        onFundingWorkplacePage.answerNumberOfStaffQuestion('1');
        onFundingWorkplacePage.expectRow('numberOfStaff').notToHaveWarning();

        onFundingWorkplacePage.getConfirmationMessageForRow('serviceUsers').find('a').contains('No, change it').click();
        onFundingWorkplacePage.answerServiceUsersQuestion();
        onFundingWorkplacePage.expectRow('serviceUsers').notToHaveWarning();

        onFundingWorkplacePage
          .getConfirmationMessageForRow('serviceCapacity')
          .find('a')
          .contains('No, change it')
          .click();
        onFundingWorkplacePage.answerServiceCapacity(10, 5);
        onFundingWorkplacePage.expectRow('serviceCapacity').notToHaveWarning();

        onFundingWorkplacePage.getConfirmationMessageForRow('mainService').find('a').contains('No, change it').click();
        onFundingWorkplacePage.answerMainServiceQuestion('Day care and day services');
        onFundingWorkplacePage.expectRow('mainService').notToHaveWarning();

        ['vacancies', 'starters', 'leavers'].forEach((testIdForRow) => {
          onFundingWorkplacePage.getConfirmationMessageForRow(testIdForRow).find('a').contains('No, change it').click();
          cy.getByLabel(/I do not know/).click();
          cy.get('button').contains(/Save/).click();
          onFundingWorkplacePage.expectRow(testIdForRow).notToHaveWarning();
        });

        cy.get('@workplaceRow').contains(eligibleMessage).should('be.visible');
      });
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
