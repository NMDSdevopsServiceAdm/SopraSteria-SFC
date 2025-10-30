/* eslint-disable no-undef */
/// <reference types="cypress" />
import { CWPAwarenessAnswers, CWPUseReasons } from '../../support/careWorkforcePathwayData';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onWorkplacePage, WorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { answerCWPAwarenessQuestion, answerCWPUseQuestion } from '../../support/page_objects/workplaceQuestionPages';

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
  const workerName = 'Test worker update staff records';

  before(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
    cy.resetWorkplaceDHAAnswers(establishmentId);
    cy.resetNonMandatoryWorkplaceQuestions(establishmentId);
    cy.insertTestWorker({ establishmentID: establishmentId, workerName });
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
    cy.resetNonMandatoryWorkplaceQuestions(establishmentId);
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName);
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

  describe('number of staff', () => {
    const staffNumber = 6;

    it('can update the number of staff successfully', () => {
      cy.get('[data-testid="numberOfStaff"]').as('testId');

      cy.get('@testId').contains('Change').click();

      cy.getByLabel('Number of staff').clear().type(staffNumber);
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains(staffNumber);
    });

    it('navigates to staff records when the number of staff does not match staff records', () => {
      cy.get('[data-testid="numberOfStaff"]').as('testId');

      cy.get('@testId').contains('Change').click();

      cy.getByLabel('Number of staff').clear().type(staffNumber);
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains('View staff records').click();

      cy.get('[data-testid="workplaceName"]').contains('Staff records');
      cy.get('[data-testid="totalStaffNumber"]').contains(`${staffNumber}`);
    });
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

  it('can update the employer type', () => {
    cy.get('[data-testid="employerType"]').as('testId');

    cy.get('@testId').contains('Change').click();

    cy.getByLabel('Voluntary, charity, not for profit').click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains('Voluntary, charity, not for profit');
  });

  it('can update the main service', () => {
    cy.get('[data-testid="mainService"]').as('testId');

    cy.get('@testId').contains('Change').click();

    //regulated by the CQC
    cy.getByLabel('No').click();
    cy.contains('button', 'Continue').click();

    //select main service
    cy.contains('Select your main service');
    cy.getByLabel('Domestic services and home help').click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains('Domestic services and home help');
  });

  describe('other services', () => {
    const heading = 'Do you provide any other services?';
    it('updates when there are no other services', () => {
      cy.get('[data-testid="otherServices"]').as('testId');

      cy.get('@testId').contains('Add').click();

      cy.get('h1').should('contain.text', heading);
      cy.getByLabel('No').click();
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains('None');
      cy.get('@testId').contains('Change').click();

      cy.get('h1').should('contain.text', heading);
    });

    it('updates when there are other services', () => {
      cy.get('[data-testid="otherServices"]').as('testId');

      cy.get('@testId').contains('Add').click();

      cy.get('h1').should('contain.text', heading);

      cy.getByLabel('Yes, we provide other services').click();
      cy.getByLabel('Other adult community care service').click();
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains('Other adult community care service');
      cy.get('@testId').contains('Change').click();

      cy.get('h1').should('contain.text', heading);
    });
  });

  describe('service capacity', () => {
    const careAmount = 5;
    const mainServices = [
      {
        id: 9,
        text: 'Day care and day services',
      },
      {
        id: 11,
        text: 'Domestic services and home help',
      },
    ];
    const heading = "What's the capacity of your services?";

    it(`can add service capacity when main service is ${mainServices[0].text}`, () => {
      cy.setWorkplaceMainService(establishmentId, mainServices[0].id);

      cy.get('[data-testid="serviceCapacity"]').as('testId');

      cy.get('@testId').contains('Add').click();

      cy.get('h1').should('contain.text', heading);

      cy.getByLabel('How many places do you have at the moment?')
        .clear()
        .type(careAmount * 2);
      cy.getByLabel('Number of those places that are being used').clear().type(careAmount);
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains(`${mainServices[0].text}: ${careAmount * 2} places`);
      cy.get('@testId').contains(`${mainServices[0].text}: ${careAmount} people using the service`);
      cy.get('@testId').contains('Change').click();

      cy.get('h1').should('contain.text', heading);
    });

    it(`can add service capacity when main service is ${mainServices[1].text}`, () => {
      cy.setWorkplaceMainService(establishmentId, mainServices[1].id);

      cy.get('[data-testid="serviceCapacity"]').as('testId');

      cy.get('@testId').contains('Add').click();

      cy.get('h1').should('contain.text', heading);
      cy.getByLabel('Number of people receiving care at the moment').clear().type(careAmount);
      cy.contains('button', 'Save and return').click();

      cy.get('@testId').contains(`${mainServices[1].text}: ${careAmount} people receiving care`);
    });
  });

  it('updates service users', () => {
    const serviceUsers = ['Older people with dementia', 'Adults with dementia'];
    const heading = 'Who are your service users?';

    cy.get('[data-testid="serviceUsers"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    for (const serviceUser of serviceUsers) cy.getByLabel(serviceUser).click();

    cy.contains('button', 'Save and return').click();

    for (const serviceUser of serviceUsers) cy.get('@testId').contains(serviceUser);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
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

  it('updates repeat training', () => {
    const repeatedTrainingAnswer = 'Yes, but not very often';
    const heading = "Do new care workers have to repeat training they've done with previous employers?";

    cy.get('[data-testid="repeat-training"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel(repeatedTrainingAnswer).click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains(repeatedTrainingAnswer);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });

  it('updates accept care certificate', () => {
    const answer = 'Yes, but not very often';
    const heading = "Would you accept a Care Certificate from a worker's previous employer?";

    cy.get('[data-testid="accept-care-certificate"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel(answer).click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains(answer);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });

  it('updates cash loyalty bonus', () => {
    const answer = 'Yes';
    const amount = 100;
    const heading = 'Do you pay care workers a cash loyalty bonus within their first 2 years of employment?';

    cy.get('[data-testid="cash-loyalty-bonus-spend"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel(answer).click();
    cy.getByLabel('Amount').clear().type(amount);
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains(`£${amount}`);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });

  it('updates statutory sick pay', () => {
    const answer = 'Yes';
    const heading = 'Do you pay your care workers more than Statutory Sick Pay if they cannot work because of illness?';

    cy.get('[data-testid="offer-more-than-statutory-sick-pay"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel(answer).click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains(answer);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });

  it('updates higher pension contributions', () => {
    const answer = 'Yes';
    const heading = 'Do you contribute more than the minimum 3% into workplace pensions for your care workers?';

    cy.get('[data-testid="higher-pension-contributions"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel(answer).click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains(answer);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });

  it('updates number of days leave', () => {
    const answer = 5;
    const heading = 'How many days leave do your full-time care workers get each year?';

    cy.get('[data-testid="number-of-days-leave"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel('Number of days').clear().type(answer);
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains(answer);
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });

  it('updates data sharing', () => {
    const heading = 'Share your data';

    cy.get('[data-testid="data-sharing"]').as('testId');

    cy.get('@testId').contains('Add').click();

    cy.get('h1').should('contain.text', heading);
    cy.getByLabel('Yes, I agree to you sharing our data with local authorities').click();
    cy.contains('button', 'Save and return').click();

    cy.get('@testId').contains('Local authorities');
    cy.get('@testId').contains('Change').click();

    cy.get('h1').should('contain.text', heading);
  });
});
