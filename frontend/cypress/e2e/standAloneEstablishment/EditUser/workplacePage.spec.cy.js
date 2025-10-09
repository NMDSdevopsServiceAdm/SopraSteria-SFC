/* eslint-disable no-undef */
/// <reference types="cypress" />
import { CWPAwarenessAnswers, CWPUseReasons } from '../../../support/careWorkforcePathwayData';
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { onWorkplacePage, WorkplacePage } from '../../../support/page_objects/onWorkplacePage';
import { answerCWPAwarenessQuestion, answerCWPUseQuestion } from '../../../support/page_objects/workplaceQuestionPages';

const workplaceSummaryPath = 'dashboard#workplace';

describe('Standalone home page as edit user', () => {
  const establishmentId = StandAloneEstablishment.id;
  const jobRoles = [
    {
      job: 'Care worker',
      total: 2,
    },
    {
      job: 'Senior care worker',
      total: 1,
    },
  ];

  const additionalJobRolesToAdd = [
    {
      job: 'Team leader',
      total: 1,
    },
  ];

  before(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
    cy.resetWorkplaceDHAAnswers(establishmentId);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  afterEach(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
    cy.resetWorkplaceDHAAnswers(establishmentId);
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  it('All sections have a change link', () => {
    onWorkplacePage.allSectionsAreChangeable();
  });

  it('can update the number of staff successfully', () => {
    cy.get('[data-testid="number-of-staff-top-row"]').contains('Change').click();
    cy.getByLabel('Number of staff').clear().type(6);
    cy.contains('button', 'Save and return').click();
    cy.get('[data-testid="number-of-staff-top-row"]').contains(6);
  });

  describe('current staff vacancies', () => {
    it('can add successfully', () => {
      cy.get('[data-testid="vacancies-top-row"]').contains('Add').click();

      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRoles);
      cy.updateJobRoleTotal(jobRoles, 'type');

      cy.contains('button', 'Save and return').click();

      jobRoles.forEach((jobRole) => {
        cy.get('[data-testid="vacancies-top-row"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });

    it('can change successfully', () => {
      // setup test
      cy.resetStartersLeaversVacancies(establishmentId);
      cy.updateVacancies({ establishmentID: establishmentId, jobId: 10, total: 1 });
      cy.updateVacancies({ establishmentID: establishmentId, jobId: 18, total: 1 });
      cy.updateVacancies({ establishmentID: establishmentId, jobId: 25, total: 1 });

      cy.reload();

      cy.get('[data-testid="vacancies-top-row"]').contains('Change').click();

      //update vacancies page
      cy.get('[data-testid="plus-button-job-0"]').click();

      cy.get('[data-testid="remove-button-Occupational therapist"]').contains('Remove').click();
      cy.contains('button', 'Add more job roles').click();

      // select job roles
      cy.addJobRoles(additionalJobRolesToAdd);

      const allJobRoles = jobRoles.concat(additionalJobRolesToAdd);

      cy.contains('button', 'Save and return').click();

      allJobRoles.forEach((jobRole) => {
        cy.get('[data-testid="vacancies-top-row"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });
  });

  describe('new starters', () => {
    it('can add successfully', () => {
      cy.get('[data-testid="starters"]').contains('Add').click();

      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRoles);
      cy.updateJobRoleTotal(jobRoles, 'type');

      cy.contains('button', 'Save and return').click();

      jobRoles.forEach((jobRole) => {
        cy.get('[data-testid="starters"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });

    it('can change successfully', () => {
      // setup test
      cy.resetStartersLeaversVacancies(establishmentId);
      cy.updateStarters({ establishmentID: establishmentId, jobId: 10, total: 1 });
      cy.updateStarters({ establishmentID: establishmentId, jobId: 18, total: 1 });
      cy.updateStarters({ establishmentID: establishmentId, jobId: 25, total: 1 });

      cy.reload();

      cy.get('[data-testid="starters"]').contains('Change').click();

      //update starters page
      cy.get('[data-testid="plus-button-job-0"]').click();
      cy.get('[data-testid="remove-button-Occupational therapist"]').contains('Remove').click();
      cy.contains('button', 'Add more job roles').click();

      // select job roles
      cy.addJobRoles(additionalJobRolesToAdd);

      const allJobRoles = jobRoles.concat(additionalJobRolesToAdd);

      cy.contains('button', 'Save and return').click();

      allJobRoles.forEach((jobRole) => {
        cy.get('[data-testid="starters"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });
  });

  describe('staff leavers', () => {
    it('can add successfully', () => {
      cy.get('[data-testid="leavers"]').contains('Add').click();

      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRoles);
      cy.updateJobRoleTotal(jobRoles, 'type');

      cy.contains('button', 'Save and return').click();

      jobRoles.forEach((jobRole) => {
        cy.get('[data-testid="leavers"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });

    it('can change successfully', () => {
      // setup test
      cy.resetStartersLeaversVacancies(establishmentId);
      cy.updateLeavers({ establishmentID: establishmentId, jobId: 10, total: 1 });
      cy.updateLeavers({ establishmentID: establishmentId, jobId: 18, total: 1 });
      cy.updateLeavers({ establishmentID: establishmentId, jobId: 25, total: 1 });

      cy.reload();

      cy.get('[data-testid="leavers"]').contains('Change').click();

      //update starters page
      cy.get('[data-testid="plus-button-job-0"]').click();
      cy.get('[data-testid="remove-button-Occupational therapist"]').contains('Remove').click();
      cy.contains('button', 'Add more job roles').click();

      // select job roles
      cy.addJobRoles(additionalJobRolesToAdd);

      const allJobRoles = jobRoles.concat(additionalJobRolesToAdd);

      cy.contains('button', 'Save and return').click();

      allJobRoles.forEach((jobRole) => {
        cy.get('[data-testid="leavers"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });
  });

  describe('Care workforce pathway workplace awareness and usage', () => {
    const reasons = [CWPUseReasons[0], CWPUseReasons[2], CWPUseReasons[5], CWPUseReasons[9]];
    const mockOtherReasonText = 'some free text for "Something else"';

    it('can update CareWorkforcePathway awareness and usage for the workplace', () => {
      cy.url().should('contain', workplaceSummaryPath);
      onWorkplacePage.clickIntoQuestion('care-workforce-pathway-awareness');

      answerCWPAwarenessQuestion(CWPAwarenessAnswers[0]); // Aware in practice
      answerCWPUseQuestion(/No/);

      // verify that answers are added to workplace summary
      cy.url().should('contain', workplaceSummaryPath);
      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue(CWPAwarenessAnswers[0].textForSummary);
      onWorkplacePage.expectRow('care-workforce-pathway-use').toHaveValue('No');

      // change CWP use to Yes with some reasons
      onWorkplacePage.clickIntoQuestion('care-workforce-pathway-use');
      answerCWPUseQuestion(/Yes/, reasons, mockOtherReasonText);

      // verify that workplace is updated with reasons
      const expectedReasonTexts = [...reasons.slice(0, -1).map((reason) => reason.text), mockOtherReasonText];
      onWorkplacePage.expectRow('care-workforce-pathway-use').toHaveMultipleValues(expectedReasonTexts);

      // change CWP awareness to Not aware
      onWorkplacePage.clickIntoQuestion('care-workforce-pathway-awareness');
      answerCWPAwarenessQuestion(CWPAwarenessAnswers[3]); // Not aware

      // should return to workplace summary without seeing CWP use question. also should hide the CWP use row
      cy.url().should('contain', workplaceSummaryPath);

      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue(CWPAwarenessAnswers[3].textForSummary);
      onWorkplacePage.expectRow('care-workforce-pathway-use').notExist();
    });
  });

  describe('Delegate healthcare activities', () => {
    const mainServiceThatCanDoDHA = { id: 9, name: 'Day care and day services' };
    const anotherMainServiceThatCanDoDHA = { id: 10, name: 'Other adult day care service' };

    const mainServiceThatCannotDoDHA = { id: 1, name: 'Carers support' };

    const mockDHAs = ['Vital signs monitoring', 'Complex posture and mobility care', 'Airways and breathing care'];

    describe('when main service is compatible with DHA', () => {
      beforeEach(() => {
        cy.setWorkplaceMainService(establishmentId, mainServiceThatCanDoDHA.id);
        cy.get('[data-cy="tab-list"]').contains('Workplace').click();
        cy.reload();
      });

      it('should see the "Carry out delegated healthcare activities" row', () => {
        cy.url().should('contain', workplaceSummaryPath);
        cy.get('div').contains('Carry out delegated healthcare activities').should('be.visible');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('-');
      });

      it('should be able to add / update the answer to delegated healthcare activities questions', () => {
        // answer DHA question 1
        onWorkplacePage.clickIntoQuestion(WorkplacePage.DHAQuestion1TestId);
        cy.get('h1').should('contain', 'Do your non-nursing staff carry out delegated healthcare activities?');
        cy.getByLabel('Yes').click();
        cy.get('button').contains(/Save/).click();

        // should continue to DHA workplace question 2
        cy.get('h1').should(
          'contain',
          'What kind of delegated healthcare activities do your non-nursing staff carry out?',
        );
        mockDHAs.forEach((activityName) => {
          cy.getByLabel(activityName).click();
        });
        cy.get('button').contains(/Save/).click();

        // after answering question 2, should be redirected back to workplace summary page
        cy.url().should('contain', workplaceSummaryPath);
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('Yes');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).toHaveMultipleValues(mockDHAs);

        // update answer to question 2
        onWorkplacePage.clickIntoQuestion(WorkplacePage.DHAQuestion2TestId);
        cy.getByLabel('I do not know').click();
        cy.get('button').contains(/Save/).click();

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).toHaveValue('Not known');

        // update answer to question 1
        onWorkplacePage.clickIntoQuestion(WorkplacePage.DHAQuestion1TestId);
        cy.getByLabel('I do not know').click();
        cy.get('button').contains(/Save/).click();

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('Not known');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).notExist();
      });
    });

    describe('when main service is NOT compatible with DHA', () => {
      beforeEach(() => {
        cy.setWorkplaceMainService(establishmentId, mainServiceThatCannotDoDHA.id);
        cy.get('[data-cy="tab-list"]').contains('Workplace').click();
        cy.reload();
      });

      it('should not see the rows for either DHA questions', () => {
        cy.url().should('contain', workplaceSummaryPath);

        cy.get('h1').should('contain.text', 'Workplace');
        cy.get('div').contains('Carry out delegated healthcare activities').should('not.exist');
        cy.get('div').contains('Which delegated healthcare activities').should('not.exist');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).notExist();
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).notExist();
      });
    });

    describe('on main service change', () => {
      beforeEach(() => {
        cy.setWorkplaceMainService(establishmentId, mainServiceThatCanDoDHA.id);
        cy.get('[data-cy="tab-list"]').contains('Workplace').click();
        cy.reload();
      });

      it('should clear the answers for DHA questions when main service change to one that cannot do DHA', () => {
        onWorkplacePage.answerDHAQuestions('Yes', mockDHAs);

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('Yes');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).toHaveMultipleValues(mockDHAs);

        // change mainService
        onWorkplacePage.clickIntoMainServiceQuestionAndAnswer(mainServiceThatCannotDoDHA.name);

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).notExist();
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).notExist();

        // change it back so that DHA question row appear again
        onWorkplacePage.clickIntoMainServiceQuestionAndAnswer(mainServiceThatCanDoDHA.name);

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('-');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).notExist();
      });

      it('should keep the answer for DHA questions unchanged when main service change to another one that can do DHA', () => {
        onWorkplacePage.answerDHAQuestions('Yes', mockDHAs);

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('Yes');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).toHaveMultipleValues(mockDHAs);

        // change mainService
        onWorkplacePage.clickIntoMainServiceQuestionAndAnswer(anotherMainServiceThatCanDoDHA.name);

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('Yes');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).toHaveMultipleValues(mockDHAs);

        // change it back
        onWorkplacePage.clickIntoMainServiceQuestionAndAnswer(mainServiceThatCanDoDHA.name);

        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion1TestId).toHaveValue('Yes');
        onWorkplacePage.expectRow(WorkplacePage.DHAQuestion2TestId).toHaveMultipleValues(mockDHAs);
      });
    });
  });
});
