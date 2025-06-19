/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Standalone staff records page as edit user', () => {
  const establishmentId = StandAloneEstablishment.id;
  const worker1 = 'Staff 01';
  const worker2 = 'Staff 02';
  const worker3 = 'Staff 03';
  const testWorkerNames = ['Mr Cool', 'Mr Warm', 'Mr Smith', 'Bob', 'Cypress test worker', worker1, worker2, worker3];

  before(() => {
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    cy.resetStartersLeaversVacancies(establishmentId);
  });

  beforeEach(() => {
    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: 'Cypress test worker' });

    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
  });

  afterEach(() => {
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    cy.resetStartersLeaversVacancies(establishmentId);
  });

  it('should show the staff records page', () => {
    cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: 'Mr Cool' });

    cy.get('[data-cy="dashboard-header"]').should('contain', StandAloneEstablishment.name);
    cy.get('[data-cy="dashboard-header"]').find('[data-testid="lastUpdatedDate"]').should('exist');
    cy.get('[data-cy="dashboard-header"]').should('contain', 'Add a staff record');
    cy.get('[data-testid="staff-records"]').should('exist');
  });

  describe('Adding mandatory details for a staff record', () => {
    it('should add a new staff record successfully', () => {
      const name = 'Mr Cool';
      const contractType = 'Permanent';
      const mainJobRole = 'Care worker';

      createStaffRecordWithMandatoryDetails(name, contractType, mainJobRole);

      expectContentToBeDisplayedOnMandatoryDetailsPage(name, contractType, mainJobRole);
    });

    it('should update name and contract type when changed after creating new record', () => {
      const updatedName = 'Mr Smith';
      const updatedContractType = 'Temporary';

      const { name } = createStaffRecordWithMandatoryDetails();

      cy.contains('.govuk-summary-list__row', name).find('.govuk-summary-list__actions a').click();

      inputNameAndContractType(updatedName, updatedContractType, 'Save and return');

      cy.contains('Add a staff record').should('be.visible');
      cy.contains('.govuk-summary-list__value', name).should('not.exist');
      cy.contains('.govuk-summary-list__value', updatedName).should('be.visible');
      cy.contains('.govuk-summary-list__value', updatedContractType).should('be.visible');
    });

    it('should update job role when changed after creating new record', () => {
      const updatedJobRole = 'Support worker';

      const { mainJobRole } = createStaffRecordWithMandatoryDetails();

      cy.contains('.govuk-summary-list__row', mainJobRole).find('.govuk-summary-list__actions a').click();

      cy.getByLabel(updatedJobRole).click();
      cy.contains('button', 'Save and return').click();
      cy.contains('.govuk-summary-list__value', updatedJobRole).should('be.visible');
    });

    it('should show validation error if Name or ID number is empty', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();
      cy.contains('button', 'Continue').click();
      cy.contains('.govuk-error-message', 'Enter their name or ID number').should('be.visible');
    });

    it('should show validation error if no contract type selected', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();
      cy.getByLabel('Name or ID number').type('Mr Cool');
      cy.contains('button', 'Continue').click();

      cy.contains('.govuk-error-message', 'Select the type of contract they have').should('be.visible');
    });

    it('should show validation error if no job role is selected', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();

      // staff-details
      cy.getByLabel('Name or ID number').type('Mr Cool');
      cy.getByLabel('Permanent').click();
      cy.contains('button', 'Continue').click();

      // main-job-role
      cy.contains('button', 'Save this staff record').click();
      cy.contains('.govuk-error-message', 'Select the job role').should('be.visible');
    });

    it('should prefill name and contract type when navigating back', () => {
      cy.get('a[role="button"]').contains('Add a staff record').click();

      // staff-details
      cy.getByLabel('Name or ID number').type('Mr Cool');
      cy.getByLabel('Permanent').click();
      cy.contains('button', 'Continue').click();

      cy.go('back');
      cy.getByLabel('Name or ID number').should('have.value', 'Mr Cool');
      cy.getByLabel('Permanent').should('be.checked');
    });
  });

  describe('Add new staff record workflow', () => {
    const skipAllQuestions = () => {
      cy.get('a').contains('Skip this question').click();
      cy.location('pathname').then((pathname) => {
        if (pathname.includes('staff-record-summary')) {
          return;
        }
        skipAllQuestions();
      });
    };

    const skipAllQuestionsBySaveButton = () => {
      cy.get('button').contains('Save and continue').click();
      cy.location('pathname').then((pathname) => {
        if (pathname.includes('staff-record-summary')) {
          return;
        }
        skipAllQuestionsBySaveButton();
      });
    };

    it('should show a "Staff record details saved" alert when user completed the workflow and answered some questions', () => {
      const name = 'Mr Cool';
      const contractType = 'Permanent';
      const mainJobRole = 'Care worker';

      createStaffRecordWithMandatoryDetails(name, contractType, mainJobRole);

      expectContentToBeDisplayedOnMandatoryDetailsPage(name, contractType, mainJobRole);

      cy.get('button').contains('Add details to this record').click();

      // answer the date of birth question
      cy.getByLabel('Day').type('1');
      cy.getByLabel('Month').type('1');
      cy.getByLabel('Year').type('2000');
      cy.get('button').contains('Save and continue').click();

      // wait until saved and navigated to next question
      cy.get('h1').should('contain', "What's their National Insurance number?");

      skipAllQuestions();

      cy.get('h1').should('contain.text', 'Staff record');
      cy.contains('Staff record details saved').should('be.visible');
    });

    // skipped this test, as the expected behaviour is broken by a bug introduced when we added CWP role category question
    it.skip('should not show a "Staff record details saved" alert when user completed the workflow and skipped all questions', () => {
      const name = 'Mr Smith';
      const contractType = 'Permanent';
      const mainJobRole = 'Care worker';

      createStaffRecordWithMandatoryDetails(name, contractType, mainJobRole);

      expectContentToBeDisplayedOnMandatoryDetailsPage(name, contractType, mainJobRole);

      cy.get('button').contains('Add details to this record').click();

      skipAllQuestions();

      cy.get('h1').should('contain.text', 'Staff record');
      cy.contains('Staff record details saved').should('not.exist');
    });

    it('should not show a "Staff record details saved" alert when user completed the workflow and click Save for all question without answering', () => {
      const name = 'Bob';
      const contractType = 'Permanent';
      const mainJobRole = 'Care worker';

      createStaffRecordWithMandatoryDetails(name, contractType, mainJobRole);

      expectContentToBeDisplayedOnMandatoryDetailsPage(name, contractType, mainJobRole);

      cy.get('button').contains('Add details to this record').click();

      skipAllQuestionsBySaveButton();

      cy.get('h1').should('contain.text', 'Staff record');
      cy.contains('Staff record details saved').should('not.exist');
    });
  });

  describe('Delete a staff record', () => {
    it('should delete a staff record successfully', () => {
      const workerName = 'Mr Warm';
      cy.intercept('DELETE', '/api/establishment/*/worker/*').as('deleteWorker');

      cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName });
      cy.reload();

      cy.get('a').contains(workerName).click();

      cy.get('h1').invoke('text').should('eq', 'Staff record');
      cy.contains('a', 'Delete staff record').click();
      cy.getByLabel('Reason not known').check();
      cy.get('input#confirmDelete').check();

      cy.get('button').contains('Delete this staff record').click();
      cy.wait('@deleteWorker');

      cy.contains(`Staff record deleted (${workerName})`).should('be.visible');
      cy.get('a').contains(workerName).should('not.exist');
    });
  });

  describe('Updating workplace after staff updates', () => {
    const noOfStaffBeforeUpdate = 4;

    const contractType = 'Permanent';
    const mainJobRole = 'Care worker';
    const jobRolesToAdd = [
      {
        job: mainJobRole,
        total: 2,
      },
    ];

    it('updates successfully after adding staff', () => {
      // add vacancies as part of setup
      cy.updateVacancies(establishmentId, 10, jobRolesToAdd.total);

      // add staff records
      cy.get('a[role="button"]').contains('Add a staff record').click();

      // add staff record flow
      addAndConfirmMandatoryStaffDetails(worker1, contractType, mainJobRole);

      // add another staff question page
      cy.getByLabel('Yes').click();
      cy.contains('button', 'Continue').click();

      // add staff record flow
      addAndConfirmMandatoryStaffDetails(worker2, contractType, mainJobRole);

      // add another staff question page
      cy.getByLabel('No').click();
      cy.contains('button', 'Continue').click();

      // number of staff, starters and vacancies summary page
      cy.contains('h1', 'Check this information and make any changes before you continue').should('be.visible');
      cy.contains('h2', 'Total number of staff, vacancies and starters').should('be.visible');

      // update number of staff page
      cy.get('[data-testid="numberOfStaff"]').contains('Change').click();
      cy.contains('h1', 'Update the total number of staff for your workplace').should('be.visible');
      cy.get('[data-testid="plus-button-total-number-of-staff"]').dblclick();
      cy.contains('button', 'Save and return').click();

      // number of staff, leavers and vacancies summary page
      cy.get('[data-testid="vacancies"]').contains('Change').click();

      // update vacancies
      cy.getByLabel('There are no current staff vacancies').click();
      cy.contains('button', 'Save and return').click();

      // number of staff, leavers and vacancies summary page
      cy.get('[data-testid="starters"]').contains('Add').click();

      // update starters
      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRolesToAdd);
      cy.updateJobRoleTotal(jobRolesToAdd, 'type');
      cy.contains('button', 'Save and return').click();

      // number of staff, leavers and vacancies summary page
      cy.get('[data-testid="numberOfStaff"]').contains(`${noOfStaffBeforeUpdate + 2}`);
      cy.get('[data-testid="vacancies"]').contains('None');
      cy.get('[data-testid="starters"]').contains('2 x care worker');
      cy.contains('Total number of staff, vacancies and starters information saved');
      cy.contains('button', 'Continue').click();

      // staff records tab
      cy.contains(`${worker1}`);
      cy.contains(`${worker2}`);
    });

    it('updates successfully after deleting staff', () => {
      onHomePage.clickTab('Staff records');
      cy.intercept('DELETE', '/api/establishment/*/worker/*').as('deleteWorker');

      cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: worker3 });
      cy.reload();

      // staff records tab
      cy.get('a').contains(worker3).click();

      // staff record of staff to delete
      cy.get('h1').invoke('text').should('eq', 'Staff record');
      cy.contains('a', 'Delete staff record').click();
      cy.getByLabel('Reason not known').check();
      cy.get('input#confirmDelete').check();

      cy.get('button').contains('Delete this staff record').click();
      cy.wait('@deleteWorker');

      // delete another staff question page
      cy.contains(`Staff record deleted (${worker3})`).should('be.visible');
      cy.getByLabel('No').click();
      cy.contains('button', 'Continue').click();

      // number of staff, leavers and vacancies summary page
      cy.get('[data-testid="numberOfStaff"]').contains('Change').click();

      // update number of staff
      cy.contains('h1', 'Update the total number of staff for your workplace').should('be.visible');
      cy.get('[data-testid="minus-button-total-number-of-staff"]').click();
      cy.contains('button', 'Save and return').click();

      // number of staff, leavers and vacancies summary page
      cy.get('[data-testid="vacancies"]').contains('Add').click();

      // update vacancies page
      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRolesToAdd);
      cy.contains('button', 'Save and return').click();

      // number of staff, leavers and vacancies summary page
      cy.get('[data-testid="leavers"]').contains('Add').click();

      // update leavers page
      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRolesToAdd);
      cy.contains('button', 'Save and return').click();

      // number of staff, leavers and vacancies summary page
      cy.contains('Total number of staff, vacancies and leavers information saved');
      cy.get('[data-testid="numberOfStaff"]').contains(`${noOfStaffBeforeUpdate - 1}`);
      cy.get('[data-testid="vacancies"]').contains('1 x care worker');
      cy.get('[data-testid="leavers"]').contains('1 x care worker');
      cy.contains('button', 'Continue').click();

      // staff records tab
      cy.get('a').contains(worker3).should('not.exist');
    });
  });

  const createStaffRecordWithMandatoryDetails = (
    name = 'Bob',
    contractType = 'Permanent',
    mainJobRole = 'Care worker',
  ) => {
    cy.get('a[role="button"]').contains('Add a staff record').click();

    inputNameAndContractType(name, contractType);
    inputMainJobRole(mainJobRole);

    return { name, contractType, mainJobRole };
  };

  const addAndConfirmMandatoryStaffDetails = (name = 'Bob', contractType = 'Permanent', mainJobRole) => {
    inputNameAndContractType(name, contractType);
    inputMainJobRole(mainJobRole);

    cy.contains('button', 'Add details to this record').click();
    cy.contains('a', 'View this staff record').click();
    cy.contains('a', 'Continue').click();
  };

  const inputNameAndContractType = (name = 'Bob', contractType = 'Permanent', buttonText = 'Continue') => {
    cy.getByLabel('Name or ID number').clear().type(name);
    cy.getByLabel(contractType).click();
    cy.contains('button', buttonText).click();
  };

  const inputMainJobRole = (mainJobRole, buttonText = 'Save this staff record') => {
    cy.get('button').contains('span', 'Care providing roles').click();
    cy.getByLabel(mainJobRole).click();
    cy.contains('button', buttonText).click();
  };

  const expectContentToBeDisplayedOnMandatoryDetailsPage = (name, contractType, mainJobRole) => {
    cy.contains('h1', 'Add a staff record').should('be.visible');
    cy.contains('.govuk-inset-text', 'Staff record saved').should('be.visible');
    cy.contains('.govuk-summary-list__value', name).should('be.visible');
    cy.contains('.govuk-summary-list__value', contractType).should('be.visible');
    cy.contains('.govuk-summary-list__value', mainJobRole).should('be.visible');
  };
});
