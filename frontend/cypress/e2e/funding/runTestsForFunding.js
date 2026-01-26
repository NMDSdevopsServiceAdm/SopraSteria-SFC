import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { FundingWorkplacePage, onFundingWorkplacePage } from '../../support/page_objects/onFundingPage';

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

export const runTestsForFundingPages = (mockEstablishmentData) => {
  describe('Funding page', () => {
    const testWorkplace = mockEstablishmentData;
    const testWorker = 'Worker to test funding page';

    const isTestingForParentViewSub = testWorkplace === SubEstablishmentNotDataOwner;

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

    describe('main funding page', () => {
      // skip this part for parent view sub as it starts from other workplaces tab
      if (isTestingForParentViewSub) {
        return;
      }

      it('should show a heading with workplace name and id', () => {
        clickIntoFundingSection();

        cy.get('h1').should('contain.text', `Does your data meet funding requirements for ${currentPeriod}`);
        cy.contains(`(Workplace ID: ${testWorkplace.nmdsId})`).should('be.visible');
        cy.contains(testWorkplace.name).should('be.visible');
      });

      it('should show the correct funding period year in funding page heading (when today is on or after 1/Apr)', () => {
        patchWdfDateInBackendReponse({
          timestamp: '2027-10-06T13:39:15.271Z',
          effectiveFrom: '2027-04-01T00:00:00.000Z',
        });

        clickIntoFundingSection();
        cy.get('h1').should('contain.text', 'Does your data meet funding requirements for 2027 to 2028?');
      });

      it('should show the correct funding period year in funding page heading (when today is before 1/Apr)', () => {
        patchWdfDateInBackendReponse({
          timestamp: '2027-03-01T13:39:15.271Z',
          effectiveFrom: '2026-04-01T00:00:00.000Z',
        });

        clickIntoFundingSection();
        cy.get('h1').should('contain.text', 'Does your data meet funding requirements for 2026 to 2027?');
      });
    });

    describe('answer for workplace', () => {
      beforeEach(() => {
        clickIntoFundingSection();
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

          clickIntoFundingWorkplaceTab();

          FundingWorkplacePage.testIdsForAllFundingRows.forEach((testId) => {
            onFundingWorkplacePage.expectRow(testId).notToHaveWarning;
          });
        });
      });

      describe('when number of staff answer is not matching with actual staff records', () => {
        before(() => {
          cy.clearWorkplaceWDFAnswers(testWorkplace.id);
          cy.insertDummyAnswerForWorkplaceWDFAnswers(testWorkplace.id);
          cy.changeWorkplaceWDFAnswersTimestamp(testWorkplace.id, new Date());
          cy.reload();
        });

        const anotherTestWorker = '2nd Test worker for funding page';

        afterEach(() => {
          cy.deleteTestWorkerFromDb(anotherTestWorker);
        });

        it('should show the workplace as non eligible', () => {
          cy.get('div[data-testid="workplace-row"]').as('workplaceRow').should('contain.text', eligibleMessage);

          cy.insertTestWorker({
            establishmentID: testWorkplace.id,
            workerName: anotherTestWorker,
          });

          cy.reload();
          cy.get('@workplaceRow').should('not.contain.text', eligibleMessage);
          cy.get('@workplaceRow').should('contain.text', nonEligibleMessage);
        });

        it('should show a warning at numberOfStaff row', () => {
          cy.insertTestWorker({
            establishmentID: testWorkplace.id,
            workerName: anotherTestWorker,
          });
          cy.reload();

          clickIntoFundingWorkplaceTab();

          onFundingWorkplacePage
            .expectRow('numberOfStaff')
            .toHaveWarningMessage(`You've 1 more staff record than staff.`);
        });
      });

      describe('when some answers are missing', () => {
        before(() => {
          cy.clearWorkplaceWDFAnswers(testWorkplace.id);
          cy.reload();
        });

        it('should show non-eligible message for workplace and warnings for the missing answers', () => {
          cy.get('div[data-testid="workplace-row"]').as('workplaceRow');
          cy.get('@workplaceRow').within(() => {
            cy.get('img[src*="red-flag"]').should('be.visible');
            cy.contains(nonEligibleMessage).should('be.visible');
          });
          clickIntoFundingWorkplaceTab();

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
          clickIntoFundingWorkplaceTab();

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

          cy.get('@workplaceRow').should('contain.text', eligibleMessage);
        });
      });

      describe('when answers are not updated', () => {
        beforeEach(() => {
          cy.clearWorkplaceWDFAnswers(testWorkplace.id);
          cy.insertDummyAnswerForWorkplaceWDFAnswers(testWorkplace.id);
          cy.changeWorkplaceWDFAnswersTimestamp(testWorkplace.id, '2017-01-01 00:00:00');
          cy.reload();

          cy.url().should('contain', 'funding');
          clickIntoFundingWorkplaceTab();
        });

        it('should show confirmation message to for outdated fields', () => {
          cy.get('@workplaceRow').should('contain.text', nonEligibleMessage);

          // skip checking for employerType row,
          // as currently WDF page have legacy logic that auto update employerType on page load
          // see wdf-workplace-summary.component.ts, updateEmployerTypeIfNotUpdatedSinceEffectiveDate()
          const rowsToCheck = FundingWorkplacePage.testIdsForAllFundingRows.filter((row) => row !== 'employerType');

          rowsToCheck.forEach((testId) => {
            onFundingWorkplacePage.expectRowToHaveConfirmationMessage(testId, 'Is this still correct?');
          });
        });

        it('should let user keep previous answer and update by clicking "Yes, it is"', () => {
          cy.get('@workplaceRow').should('contain.text', nonEligibleMessage);

          FundingWorkplacePage.testIdsForAllFundingRows.forEach((testId) => {
            if (testId === 'employerType') {
              // skip employerType as it won't show confirmation message
              return;
            }

            onFundingWorkplacePage.getConfirmationMessageForRow(testId).find('button').contains('Yes, it is').click();

            onFundingWorkplacePage.getConfirmationMessageForRow(testId).within(() => {
              cy.contains('Meeting requirements').should('be.visible');
              cy.get('img[src*="tick-icon"]').should('be.visible');
            });
          });

          cy.get('@workplaceRow').should('contain.text', eligibleMessage);
        });

        it('should let user change their answer by clicking "No, change it"', () => {
          cy.get('@workplaceRow').should('contain.text', nonEligibleMessage);

          onFundingWorkplacePage
            .getConfirmationMessageForRow('numberOfStaff')
            .find('a')
            .contains('No, change it')
            .click();
          onFundingWorkplacePage.answerNumberOfStaffQuestion('1');
          onFundingWorkplacePage.expectRow('numberOfStaff').notToHaveWarning();

          onFundingWorkplacePage
            .getConfirmationMessageForRow('serviceUsers')
            .find('a')
            .contains('No, change it')
            .click();
          onFundingWorkplacePage.answerServiceUsersQuestion();
          onFundingWorkplacePage.expectRow('serviceUsers').notToHaveWarning();

          onFundingWorkplacePage
            .getConfirmationMessageForRow('serviceCapacity')
            .find('a')
            .contains('No, change it')
            .click();
          onFundingWorkplacePage.answerServiceCapacity(10, 5);
          onFundingWorkplacePage.expectRow('serviceCapacity').notToHaveWarning();

          onFundingWorkplacePage
            .getConfirmationMessageForRow('mainService')
            .find('a')
            .contains('No, change it')
            .click();
          onFundingWorkplacePage.answerMainServiceQuestion('Day care and day services');
          onFundingWorkplacePage.expectRow('mainService').notToHaveWarning();

          ['vacancies', 'starters', 'leavers'].forEach((testIdForRow) => {
            onFundingWorkplacePage
              .getConfirmationMessageForRow(testIdForRow)
              .find('a')
              .contains('No, change it')
              .click();
            cy.getByLabel(/I do not know/).click();
            cy.get('button').contains(/Save/).click();
            onFundingWorkplacePage.expectRow(testIdForRow).notToHaveWarning();
          });

          cy.get('@workplaceRow').should('contain.text', eligibleMessage);
        });
      });
    });

    const clickIntoFundingSection = () => {
      cy.intercept('GET', '/api/reports/wdf/establishment/*').as('reports');

      cy.get('a').contains('Does your data meet funding requirements?').click();
      cy.get('h1').should('contain.text', `Does your data meet funding requirements for`);

      cy.wait('@reports');

      if (isTestingForParentViewSub) {
        // for parent view sub, further click into the sub workplace

        cy.get('div[data-testid="workplaces-row"]').as('yourOtherWorkplacesRow');
        cy.get('@yourOtherWorkplacesRow').find('a').click();
        cy.get('a').contains(testWorkplace.name).click();
        cy.get('h1').should('contain.text', `${testWorkplace.name}: data`);
      }
    };

    const clickIntoFundingWorkplaceTab = () => {
      cy.get('div[data-testid="workplace-row"]').as('workplaceRow');

      // skip for parent view sub as it start from within workplace tab
      if (isTestingForParentViewSub) {
        return;
      }
      cy.get('@workplaceRow').find('a').click();
    };

    const patchWdfDateInBackendReponse = (overrides) => {
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
};
