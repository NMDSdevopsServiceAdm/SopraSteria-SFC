/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { clickAddLinkForRow, clickIntoWorkerTAndQRecordPage } from './trainingCourse/helpers';
import { userPassword } from '../../support/configData';

describe('mandatory training', { tags: '@mandatoryTraining' }, () => {
  const establishmentID = StandAloneEstablishment.id;

  before(() => {
    cy.archiveAllWorkersInWorkplace(establishmentID);

    cy.removeAllMandatoryTrainings(establishmentID);
    cy.insertTestWorker({ establishmentID, workerName, mainJobFKValue: jobID });
  });

  const workerName = 'worker to test mandatory training';
  const jobID = 11;
  const workerMainJobRole = 'Community support and outreach work';
  const categoryIdForAutism = 2;
  const categoryIdForCommunication = 4;
  const categoryIdForDutyOfCare = 13;

  it('can add mandatory training category to workplace', () => {
    cy.loginAndVisitTab(StandAloneEstablishment.editUserLoginName, userPassword, 'training-and-qualifications');
    clickIntoMandatoryTrainingPage();

    // mandatory training for all job roles
    addMandatoryTraining('Autism', null);

    // mandatory training for selected job role
    addMandatoryTraining('Communication', workerMainJobRole);
    addMandatoryTraining('Duty of care', 'Care worker');

    onHomePage.clickTab('Training and qualifications');
    clickIntoWorkerTAndQRecordPage(workerName);

    cy.contains('table', 'Actions list').within(() => {
      cy.contains('Autism').should('be.visible');
      cy.contains('Communication').should('be.visible');
      cy.contains('Duty of care').should('not.exist');
    });
  });

  it('can change a mandatory training', () => {
    cy.removeAllMandatoryTrainings(establishmentID);

    cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForAutism, jobID });
    cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForCommunication, jobID });
    cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForDutyOfCare, jobID });

    cy.loginAndVisitTab(StandAloneEstablishment.editUserLoginName, userPassword, 'training-and-qualifications');

    clickIntoMandatoryTrainingPage();

    cy.get('[data-testid="training-table"]').as('mandatoryTrainingTable').should('be.visible');

    cy.contains('a', 'Communication').click();

    // change to "Fire safety" category
    cy.get('h1').should('contain', 'Select the training category that you want to make mandatory');

    cy.contains('Show all categories').click();
    cy.getByLabel('Fire safety').click();
    cy.contains('button', 'Continue').click();
    cy.getByLabel('All job roles').click();
    cy.contains('button', 'Continue').click();

    cy.get('app-alert span').should('contain', 'Mandatory training category updated');
    cy.get('@mandatoryTrainingTable').within(() => {
      cy.contains('Communication').should('not.exist');
      cy.contains('Fire safety').should('be.visible');
    });
  });

  it('can remove mandatory training', () => {
    cy.removeAllMandatoryTrainings(establishmentID);

    cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForAutism, jobID });
    cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForCommunication, jobID });
    cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForDutyOfCare, jobID });

    cy.loginAndVisitTab(StandAloneEstablishment.editUserLoginName, userPassword, 'training-and-qualifications');

    clickIntoMandatoryTrainingPage();

    cy.get('[data-testid="training-table"]').as('mandatoryTrainingTable').should('be.visible');
    cy.get('@mandatoryTrainingTable').within(() => {
      cy.contains('tr', 'Autism').as('autismRow').should('be.visible');
      cy.contains('tr', 'Communication').as('communicationRow').should('be.visible');
      cy.contains('tr', 'Duty of care').as('dutyOfCareRow').should('be.visible');
      cy.contains('a', 'Remove all').as('removeAllLink').should('be.visible');
    });

    // remove one category
    cy.get('@communicationRow').find('a:contains("Remove")').click();

    cy.get('h1').should('contain', "You're about to remove this mandatory training category");
    cy.contains('button', 'Remove category').click();

    cy.get('app-alert span').should('contain', 'Mandatory training category removed');
    cy.get('@autismRow').should('be.visible');
    cy.get('@communicationRow').should('not.exist');
    cy.get('@dutyOfCareRow').should('be.visible');

    // remove all
    cy.get('@removeAllLink').click();
    const expectedText = "You're about to remove all mandatory training categories for your workplace";
    cy.get('h1').should('contain', expectedText);

    cy.contains('button', 'Remove categories').click();

    cy.get('app-alert span').should('contain', 'All mandatory training categories removed');
    cy.get('@mandatoryTrainingTable').should('not.exist');
  });

  describe('missing mandatory training warnings', () => {
    before(() => {
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({
        establishmentID,
        categoryId: categoryIdForCommunication,
        name: 'Communication course',
      });

      cy.removeAllMandatoryTrainings(establishmentID);

      cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForAutism, jobID });
      cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForCommunication, jobID });
    });

    beforeEach(() => {
      cy.loginAndVisitTab(StandAloneEstablishment.editUserLoginName, userPassword, 'training-and-qualifications');
    });

    it('should show a warning and an Add link for each missing mandatory training of a worker', () => {
      cy.contains('a', '1 staff is missing mandatory training').should('be.visible').as('missingWarning');
      cy.get('@missingWarning').click();

      cy.get('h1').should('contain', 'Staff missing mandatory training');

      // when no course for the category, Add link should skip the course selection and show select category page
      clickAddLinkForRow('Autism');
      cy.get('h1').should('contain', 'Select the category that best matches the training taken');
      cy.getByLabel('Autism').should('be.checked');

      cy.contains('a', 'Back').click();

      // when there is a course for the category, Add link should lead to the new 'Add a training record' page
      clickAddLinkForRow('Communication');
      cy.get('h1').should('contain', 'Add a training record');
      cy.getByLabel('Continue without selecting a training course').should('exist');
      cy.getByLabel('Communication course').should('exist');
    });

    it('should show missing mandatory training warning and Add links in the Action list', () => {
      onHomePage.clickTab('Training and qualifications');
      clickIntoWorkerTAndQRecordPage(workerName);
      cy.contains('table', 'Actions list').within(() => {
        cy.contains('Autism').should('be.visible');
        cy.contains('Communication').should('be.visible');
      });

      // when no course for the category, Add link should skip the course selection and show select category page
      clickAddLinkForRow('Autism');
      cy.get('h1').should('contain', 'Select the category that best matches the training taken');
      cy.getByLabel('Autism').should('be.checked');

      cy.contains('a', 'Back').click();

      // when there is a course for the category, Add link should lead to the new 'Add a training record' page
      clickAddLinkForRow('Communication');
      cy.get('h1').should('contain', 'Add a training record');
      cy.getByLabel('Continue without selecting a training course').should('exist');
      cy.getByLabel('Communication course').should('exist');
    });
  });
});

function clickIntoMandatoryTrainingPage() {
  cy.contains('button', 'Add and manage training').click();
  cy.contains('a', 'Manage mandatory training').click();

  cy.get('h1').should('contain', 'Add and manage mandatory training categories');
}

function addMandatoryTraining(category, selectedJobRole = null) {
  cy.contains('button', 'Add a mandatory training category').click();
  cy.get('h1').should('contain', 'Select the training category that you want to make mandatory');
  cy.contains('Show all categories').click();
  cy.getByLabel(category).click();
  cy.contains('button', 'Continue').click();

  cy.get('h1').should('contain', 'Which job roles need this training?');
  const optionToChoose = selectedJobRole ? 'Only selected job roles' : 'All job roles';

  cy.getByLabel(optionToChoose).click();
  cy.contains('button', 'Continue').click();

  if (selectedJobRole) {
    cy.get('h1').should('contain', 'Select the job roles that need this training');
    cy.contains('Show all job roles').click();
    cy.getByLabel(selectedJobRole).click();
    cy.contains('button', 'Save mandatory training').click();
  }

  cy.get('app-alert span').should('contain', 'Mandatory training category added');
}
