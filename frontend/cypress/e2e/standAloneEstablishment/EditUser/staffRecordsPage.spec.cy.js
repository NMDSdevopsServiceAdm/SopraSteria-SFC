/* eslint-disable no-undef */
/// <reference types="cypress" />

import lodash from 'lodash';
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';
import { onStaffRecordsPage, onStaffRecordSummaryPage } from '../../../support/page_objects/onStaffRecordsPage';
import { onWorkplacePage } from '../../../support/page_objects/onWorkplacePage';

describe('Standalone staff records page as edit user', () => {
  const establishmentId = StandAloneEstablishment.id;
  const worker1 = 'Staff 01';
  const worker2 = 'Staff 02';
  const worker3 = 'Staff 03';
  const testWorkerNames = ['Cypress test worker', 'Mr Cool', 'Mr Warm', 'Mr Smith', 'Bob', , worker1, worker2, worker3];

  before(() => {
    testWorkerNames.forEach((workerName) =>
      cy.deleteWorkerQualificationsRecord({ establishmentID: establishmentId, workerName }),
    );
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    cy.resetStartersLeaversVacancies(establishmentId);
  });

  beforeEach(() => {
    cy.insertTestWorker({ establishmentID: establishmentId, workerName: 'Cypress test worker' });

    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    onHomePage.clickTab('Staff records');
    cy.reload();
  });

  afterEach(() => {
    testWorkerNames.forEach((workerName) =>
      cy.deleteWorkerQualificationsRecord({ establishmentID: establishmentId, workerName }),
    );
    testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    cy.resetStartersLeaversVacancies(establishmentId);
  });

  it('should show the staff records page', () => {
    cy.insertTestWorker({ establishmentID: establishmentId, workerName: 'Mr Cool' });

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

    it('should not show a "Staff record details saved" alert when user completed the workflow and skipped all questions', () => {
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

    it('should delete a staff record successfully when the user does want to download the summary and any certificates', () => {
      const workerName = 'Mr Warm';

      cy.intercept('DELETE', '/api/establishment/*/worker/*').as('deleteWorker');

      cy.insertTestWorker({ establishmentID: establishmentId, workerName });
      cy.reload();
      cy.addWorkerQualification({
        establishmentID: establishmentId,
        workerName,
        categoryId: 121,
      });

      cy.reload();

      cy.get('a').contains(workerName).click();

      cy.get('h1').invoke('text').should('eq', 'Staff record');
      cy.contains('a', 'Delete staff record').click();

      // do you want to download summary & certificates page
      cy.get('h1')
        .invoke('text')
        .should(
          'eq',
          'Do you want to download their training and qualifications summary, and any certificates, before you delete this staff record?',
        );
      cy.getByLabel('Yes, I want to download the summary and any certificates').check();
      cy.get('button').contains('Continue').click();

      // delete staff record page
      cy.contains("The training and qualifications summary has downloaded to your computer's Downloads folder").should(
        'be.visible',
      );
      cy.getByLabel('Reason not known').check();
      cy.get('input#confirmDelete').check();

      cy.get('button').contains('Delete this staff record').click();
      cy.wait('@deleteWorker');

      cy.contains(`Staff record deleted (${workerName})`).should('be.visible');
      cy.get('a').contains(workerName).should('not.exist');
    });

    it('should delete a staff record successfully when the user does not want to download the summary and any certificates', () => {
      const workerName = 'Mr Warm';

      cy.intercept('DELETE', '/api/establishment/*/worker/*').as('deleteWorker');

      cy.insertTestWorker({ establishmentID: establishmentId, workerName });
      cy.reload();
      cy.addWorkerQualification({
        establishmentID: establishmentId,
        workerName,
        categoryId: 121,
      });

      cy.reload();

      cy.get('a').contains(workerName).click();

      cy.get('h1').invoke('text').should('eq', 'Staff record');
      cy.contains('a', 'Delete staff record').click();

      // do you want to download summary & certificates page
      cy.get('h1')
        .invoke('text')
        .should(
          'eq',
          'Do you want to download their training and qualifications summary, and any certificates, before you delete this staff record?',
        );
      cy.getByLabel('No, I do not want to download the summary and any certificates').check();
      cy.get('button').contains('Continue').click();

      // delete staff record page
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

  describe('search and sort by', () => {
    const testWorkerNames = lodash.range(1, 31).map((i) => `testSearchAndSortBy${i}`);
    const sortByOptions = [
      { value: '0_asc', label: 'Staff name (A to Z)' },
      { value: '0_dsc', label: 'Staff name (Z to A)' },
      { value: '1_asc', label: 'Job role (A to Z)' },
      { value: '1_dsc', label: 'Job role (Z to A)' },
      { value: '3_last_update_newest', label: 'Last update (newest)' },
      { value: '3_last_update_oldest', label: 'Last update (oldest)' },
      { value: '4_add_more_details', label: 'Add more details' },
    ];

    describe('when total number of workers is over 15', () => {
      before(() => {
        cy.archiveAllWorkersInWorkplace(StandAloneEstablishment.id);
        testWorkerNames.forEach((workerName) => {
          cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName });
        });
      });

      after(() => {
        testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
      });

      it('should show a search box and sort by options', () => {
        onHomePage.clickTab('Staff records');

        cy.get('label').contains('Search by name or ID number').should('exist');
        cy.get('label').contains('Sort by').should('exist');
        cy.getByLabel('Sort by').should('have.value', sortByOptions[0].value);
      });

      it('should keep the sort order and search text after visiting a staff record page and then come back', () => {
        onHomePage.clickTab('Staff records');

        // select sort by "Staff name Z to A"
        cy.getByLabel('Sort by').select(1);
        cy.getByLabel('Sort by').should('have.value', sortByOptions[1].value);

        // add a search criteria
        cy.getByLabel('Search by name or ID number').type('testSearchAndSortBy');
        cy.get('button').contains('search').click();
        cy.get('button').contains('Clear search results').should('exist');

        cy.get('a').contains('testSearchAndSortBy30').click();

        cy.url().should('include', 'staff-record-summary');
        cy.get('[data-testid="section-heading"]').should('contain', 'testSearchAndSortBy30');

        // go back to all staff records tab
        cy.go('back');
        cy.url().should('not.include', 'staff-record-summary');

        cy.getByLabel('Sort by').should('have.value', sortByOptions[1].value);
        cy.getByLabel('Search by name or ID number').should('have.value', 'testSearchAndSortBy');
      });

      it('should reset the sort order if visit some other tab and then come back', () => {
        onHomePage.clickTab('Staff records');

        cy.getByLabel('Search by name or ID number').should('be.visible');
        cy.getByLabel('Sort by').should('have.value', sortByOptions[0].value);

        cy.getByLabel('Sort by').select(1);
        cy.getByLabel('Sort by').should('have.value', sortByOptions[1].value);

        onHomePage.clickTab('Training and qualifications');

        cy.get('h1').should('include.text', 'Training and qualifications');

        // go back to all staff records tab
        onHomePage.clickTab('Staff records');
        cy.get('h1').should('include.text', 'Staff records');

        cy.getByLabel('Sort by').should('have.value', sortByOptions[0].value);
        cy.getByLabel('Search by name or ID number').should('have.value', '');
      });

      it('the search function should not cause side effect on total worker count', () => {
        // this test captures a bug in which search result wrongly overwrites the total worker count in staff records tab

        onHomePage.clickTab('Staff records');
        cy.get('[data-cy="total-staff-panel"]').should('include.text', '31  staff records added');
        cy.get('[data-testid="staffAddedNumber"]').should('contain.text', '31');

        cy.getByLabel('Search by name or ID number').type('12');
        cy.get('button').contains('search').click();
        cy.get('button').contains('Clear search results').should('exist');

        cy.get('a').contains('testSearchAndSortBy12').click();

        cy.url().should('include', 'staff-record-summary');
        cy.get('[data-testid="section-heading"]').should('contain', 'testSearchAndSortBy12');

        // go back to all staff records tab
        cy.go('back');

        cy.get('[data-cy="total-staff-panel"]').should('include.text', '31  staff records added');
        cy.get('[data-testid="staffAddedNumber"]').should('contain.text', '31');
      });
    });

    describe('when total number of workers less then 15', () => {
      before(() => {
        testWorkerNames.slice(0, 5).forEach((workerName) => {
          cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName });
        });
      });

      after(() => {
        testWorkerNames.slice(0, 5).forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
      });

      it('should not show a search box', () => {
        onHomePage.clickTab('Staff records');

        cy.get('label').contains('Search by name or ID number').should('not.exist');
      });
    });
  });

  describe('delegated healthcare activities', () => {
    const careWorker = 'care worker';
    const ITManager = 'IT manager';

    const mainServiceThatCanDoDHA = { id: 9, name: 'Day care and day services' };
    const mainServiceThatCannotDoDHA = { id: 1, name: 'Carers support' };

    before(() => {
      cy.setWorkplaceMainService(establishmentId, mainServiceThatCanDoDHA.id);
      cy.resetWorkplaceDHAAnswers(establishmentId);
    });

    beforeEach(() => {
      cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName: careWorker, mainJobFKValue: 10 });
      cy.insertTestWorker({
        establishmentID: StandAloneEstablishment.id,
        workerName: ITManager,
        mainJobFKValue: 36,
      });
      cy.reload();
    });

    afterEach(() => {
      cy.deleteTestWorkerFromDb(careWorker);
      cy.deleteTestWorkerFromDb(ITManager);
    });

    describe(`if worker's job role can do DHA`, () => {
      it('should be able to add / update the answer for DHA worker question', () => {
        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(careWorker);

        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').toHaveValue('-');
        cy.contains('div', 'Carries out delegated healthcare activities').contains('Add').click();

        // answer the worker DHA question
        cy.get('h1').should('contain.text', 'Do they carry out delegated healthcare activities?');
        cy.getByLabel('Yes').click();
        cy.get('button').contains(/Save/).click();

        // should see the value updated in worker summary
        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').toHaveValue('Yes');

        cy.contains('div', 'Carries out delegated healthcare activities').contains('Change').click();

        // change the answer for worker DHA question
        cy.get('h1').should('contain.text', 'Do they carry out delegated healthcare activities?');
        cy.getByLabel('I do not know').click();
        cy.get('button').contains(/Save/).click();

        // should see the value updated in worker summary
        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').toHaveValue('Not known');
      });
    });

    describe("if worker's job role cannot do DHA", () => {
      it('should NOT see the delegate healthcare activities worker question', () => {
        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(ITManager);

        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').notExist();
      });
    });

    describe('relationship with workplace DHA questions answer', () => {
      beforeEach(() => {
        // reset any change to workplace answers between each test
        cy.setWorkplaceMainService(establishmentId, mainServiceThatCanDoDHA.id);
        cy.resetWorkplaceDHAAnswers(establishmentId);
        cy.reload();
      });

      it('should NOT see the DHA worker question if workplace main service is not compatible with DHA', () => {
        onHomePage.clickTab('Workplace');
        onWorkplacePage.answerMainServiceQuestion(mainServiceThatCannotDoDHA.name);

        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(careWorker);
        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').notExist();
      });

      it('should NOT see the DHA worker question if workplace answered "No" for DHA workplace question 1', () => {
        onHomePage.clickTab('Workplace');
        onWorkplacePage.answerDHAQuestions('No');

        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(careWorker);
        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').notExist();
      });

      ['Yes', 'I do not know'].forEach((value) => {
        it(`should see the DHA worker question if workplace answered "${value}" for DHA workplace question 1`, () => {
          onHomePage.clickTab('Workplace');
          onWorkplacePage.answerDHAQuestions(value);

          onHomePage.clickTab('Staff records');
          onStaffRecordsPage.clickIntoWorker(careWorker);
          onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').toHaveValue('-');
        });
      });

      it('should see the DHA worker question if workplace did not answer DHA workplace question', () => {
        onHomePage.clickTab('Staff records');
        onStaffRecordsPage.clickIntoWorker(careWorker);
        onStaffRecordSummaryPage.expectRow('Carries out delegated healthcare activities').toHaveValue('-');
      });
    });
  });

  describe('pagination controls in staff record summary page', () => {
    const testWorkerNames = Array(5)
      .fill()
      .map((_, index) => `test worker pagination ${index.toString().padStart(2, 0)}`);

    before(() => {
      testWorkerNames.forEach((workerName) =>
        cy.insertTestWorker({ establishmentID: StandAloneEstablishment.id, workerName }),
      );
    });

    after(() => {
      testWorkerNames.forEach((workerName) => cy.deleteTestWorkerFromDb(workerName));
    });

    beforeEach(() => {
      onHomePage.clickTab('Home');
      onHomePage.clickTab('Staff records');
    });

    it('should allow user to cycle between workers by the "Previous staff record" and "Next staff record" links', () => {
      onStaffRecordsPage.clickIntoWorker(testWorkerNames[2]);
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorkerNames[2]);
      cy.get('a').contains('Previous staff record').should('be.visible');
      cy.get('a').contains('Next staff record').should('be.visible');

      // visit previous worker
      cy.get('a').contains('Previous staff record').click();
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorkerNames[1]);

      // visit next worker
      cy.get('a').contains('Next staff record').click();
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorkerNames[2]);

      cy.get('a').contains('Next staff record').click();
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorkerNames[3]);
    });

    it('should direct user back to staff records page when "Close this staff record" button is clicked', () => {
      onStaffRecordsPage.clickIntoWorker(testWorkerNames[2]);
      onStaffRecordSummaryPage.expectRow('Name or ID number').toHaveValue(testWorkerNames[2]);

      cy.get('a').contains('Close this staff record').click();

      cy.get('h1').should('include.text', 'Staff records');
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
