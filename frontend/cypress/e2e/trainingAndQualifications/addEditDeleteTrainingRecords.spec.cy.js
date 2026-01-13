/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import {
  clickAddLinkForRow,
  clickUpdateLinkForRow,
  clickIntoWorkerTAndQRecordPage,
  expectTrainingRecordPageToHaveCourseDetails,
  expectPageToHaveDetails,
} from './trainingCourse/helpers';

describe('training record', () => {
  const workerName1 = 'Test worker';
  const workerName2 = 'Test worker 2';
  const trainingCategory = 'Health and safety awareness';
  const trainingName = 'Test Training';
  const establishmentID = StandAloneEstablishment.id;
  const trainingCourseName = 'Test training course';

  before(() => {
    cy.deleteAllTrainingCourses(establishmentID);
    cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName1 });
    cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName2 });

    cy.deleteTestWorkerFromDb(workerName1);
    cy.deleteTestWorkerFromDb(workerName2);

    cy.insertTestWorker({ establishmentID, workerName: workerName1 });
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();

    cy.addWorkerTraining({
      establishmentID,
      workerName: workerName1,
      categoryId: 1,
    });
    cy.reload();
  });

  after(() => {
    cy.deleteTestWorkerFromDb(workerName1);
    cy.deleteTestWorkerFromDb(workerName2);
  });

  afterEach(() => {
    cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName1 });
    cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName2 });
  });

  describe('no training courses', () => {
    it('should add successfully when picking an external provider not on the select list', () => {
      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', 'Add a training record').click();

      // select training category
      cy.contains('button', 'Show all categories').click();
      cy.getByLabel(trainingCategory).click();
      cy.contains('button', 'Continue').click();

      // add training record details
      cy.get('[data-testid="trainingCategoryDisplay"]').contains(trainingCategory);
      cy.contains('a', 'Change');
      cy.getByLabel('Training record name').clear().type(trainingName);

      cy.get('#accredited-yes').check().should('be.checked');
      cy.get('#deliveredBy-ExternalProvider').check().should('be.checked');
      cy.get('#conditional-external-provider-name').should('not.have.class', 'govuk-radios__conditional--hidden');
      cy.getByLabel('Provider name').type('Care skills academy');
      cy.get('#howWasItDelivered-FaceToFace').check().should('be.checked');
      cy.get('#validity-period').clear().type('12');
      cy.get('#doesNotExpire').check().should('be.checked');

      cy.get('[data-testid="completedDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2025);
      });

      cy.contains('button', 'Open notes').click();
      cy.get('[data-testid="notesSection"]').clear().type('Refresh');
      cy.contains('button', 'Save record').click();

      // staff training and qualifications page
      cy.get('[data-testid="generic_alert"]').contains('Training record added');
      cy.contains(trainingName);
    });

    it('should add successfully when picking an external provider from the select list', () => {
      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', 'Add a training record').click();

      // select training category
      cy.contains('button', 'Show all categories').click();
      cy.getByLabel(trainingCategory).click();
      cy.contains('button', 'Continue').click();

      // add training record details
      cy.get('[data-testid="trainingCategoryDisplay"]').contains(trainingCategory);
      cy.contains('a', 'Change');
      cy.getByLabel('Training record name').clear().type(trainingName);

      cy.get('#deliveredBy-ExternalProvider').check().should('be.checked');
      cy.get('#conditional-external-provider-name').should('not.have.class', 'govuk-radios__conditional--hidden');
      cy.getByLabel('Provider name').type('stop');
      cy.get('[data-testid="tray-list"]').contains('1Stop Training').click();

      cy.get('#doesNotExpire').check().should('be.checked');

      cy.contains('button', 'Save record').click();

      // staff training and qualifications page
      cy.get('[data-testid="generic_alert"]').contains('Training record added');
      cy.contains(trainingName);
    });
  });

  describe('with training courses', () => {
    const trainingCourseDetails = {
      name: 'Test add new training record with training course',
      accredited: 'Yes',
      deliveredBy: 'External provider',
      providerName: '',
      howWasItDelivered: 'E-learning',
      doesNotExpire: false,
      validityPeriodInMonth: 24,
    };
    const trainingCourseName = trainingCourseDetails.name;

    before(() => {
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({ establishmentID, categoryId: 1, ...trainingCourseDetails });
      cy.reload();
    });

    after(() => {
      cy.deleteAllTrainingCourses(establishmentID);
    });

    it('should add successfully when no training course is picked', () => {
      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', 'Add a training record').click();

      // add a training record
      cy.get('h1').should('contain', 'Add a training record');
      cy.getByLabel('Continue without selecting a training course').click();
      cy.contains('button', 'Continue').click();

      // select training category
      cy.contains('button', 'Show all categories').click();
      cy.getByLabel(trainingCategory).click();
      cy.contains('button', 'Continue').click();

      // add training record details
      cy.get('[data-testid="trainingCategoryDisplay"]').contains(trainingCategory);
      cy.contains('a', 'Change');
      cy.getByLabel('Training record name').clear().type(trainingName);
      cy.getByLabel('Yes').click();

      cy.get('[data-testid="completedDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2025);
      });

      cy.contains('button', 'Open notes').click();
      cy.get('[data-testid="notesSection"]').clear().type('Refresh');
      cy.contains('button', 'Save record').click();

      // staff training and qualifications page
      cy.get('[data-testid="generic_alert"]').contains('Training record added');
      cy.contains(trainingName);
    });

    it('should add successfully when a training course is picked', () => {
      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', 'Add a training record').click();

      // add a training record
      cy.get('h1').should('contain', 'Add a training record');
      cy.getByLabel(trainingCourseName).click();
      cy.contains('button', 'Continue').click();

      cy.getByLabel('Day').type('15');
      cy.getByLabel('Month').type('06');
      cy.getByLabel('Year').type('2025');

      cy.contains('Open notes').click();
      cy.getByLabel('Add a note').type('some notes');

      cy.get('button').contains('Save training record').click();

      cy.get('h1').should('contain', 'Training and qualifications');
      cy.get('[data-testid="workerNameAndRole"]').should('contain', workerName1);
      cy.get('app-alert span').should('contain', 'Training record added');

      // verify that the training record has picked up training course details
      cy.get('a').contains(trainingCourseName).click();
      cy.get('h1').should('contain', 'Training record details');

      expectTrainingRecordPageToHaveCourseDetails({
        ...trainingCourseDetails,
        courseName: trainingCourseName,
        completedDate: '2025-06-15',
        expiryDate: '2027-06-15',
        notes: 'some notes',
      });
    });
  });

  it('should update successfully', () => {
    cy.intercept('GET', '/api/establishment/*/worker/*/training/*').as('trainingRecord');
    cy.intercept('GET', '/api/trainingCategories').as('trainingCategories');

    cy.addWorkerTraining({ establishmentID, workerName: workerName1, categoryId: 4 });
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
    cy.contains('a', trainingName).click();

    // update training record details
    cy.wait('@trainingRecord');
    cy.wait('@trainingCategories');

    cy.get('#accredited-no').check().should('be.checked');
    cy.get('#deliveredBy-ExternalProvider').check().should('be.checked');
    cy.get('#conditional-external-provider-name').should('not.have.class', 'govuk-radios__conditional--hidden');
    cy.getByLabel('Provider name').type('Care skills academy');
    cy.get('#howWasItDelivered-FaceToFace').check().should('be.checked');
    cy.get('#validity-period').clear().type('12');
    cy.get('#doesNotExpire').check().should('be.checked');

    cy.get('[data-testid="completedDate"]').within(() => {
      cy.getByLabel('Day').clear().type(31);
      cy.getByLabel('Month').clear().type(3);
      cy.getByLabel('Year').clear().type(2025);
    });

    cy.get('[data-testid="expiresDate"]').within(() => {
      cy.getByLabel('Day').clear().type(31);
      cy.getByLabel('Month').clear().type(3);
      cy.getByLabel('Year').clear().type(2026);
    });

    cy.contains('button', 'Save and return').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('Training record updated');
  });

  it('should delete successfully', () => {
    cy.addWorkerTraining({ establishmentID, workerName: workerName1, categoryId: 4 });
    cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
    cy.contains('a', trainingName).click();

    // training record
    cy.contains('a', 'Delete this training record').click();

    // Confirm deletion
    cy.contains('button', 'Delete record').click();

    // staff training and qualifications page
    cy.get('[data-testid="generic_alert"]').contains('Training record deleted');
  });

  describe('update existing training record (related to training course)', () => {
    const trainingCourseDetails = {
      name: 'Test add course detail to record',
      accredited: 'No',
      deliveredBy: 'In-house staff',
      howWasItDelivered: 'E-learning',
      doesNotExpire: false,
      validityPeriodInMonth: 12,
    };

    const anotherTrainingCourse = {
      name: 'Another training course for test',
      accredited: 'Yes',
      deliveredBy: 'External provider',
      trainingProviderId: 1,
      trainingProviderName: '1Stop Training',
      howWasItDelivered: 'Face to face',
      doesNotExpire: true,
      validityPeriodInMonth: null,
    };

    const trainingCourseName = trainingCourseDetails.name;
    const anotherTrainingCourseName = anotherTrainingCourse.name;

    before(() => {
      cy.insertTrainingCourse({
        ...trainingCourseDetails,
        establishmentID: StandAloneEstablishment.id,
        categoryId: 1,
      });
      cy.insertTrainingCourse({
        ...anotherTrainingCourse,
        establishmentID: StandAloneEstablishment.id,
        categoryId: 1,
      });
    });

    beforeEach(() => {
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName1 });
    });

    after(() => {
      cy.deleteAllTrainingCourses(establishmentID);
    });

    it('should be able to apply course details to a training record that is not linked to a course', () => {
      cy.addWorkerTraining({
        establishmentID: StandAloneEstablishment.id,
        workerName: workerName1,
        categoryId: 1,
        completedDate: '2025-03-30',
      });
      cy.reload();

      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', trainingName).click();

      cy.contains('button', 'Select a training course').click();
      cy.get('[data-testid="workerName"]').contains(workerName1).should('be.visible');
      cy.getByLabel(trainingCourseName).should('exist');
      cy.getByLabel(anotherTrainingCourseName).should('exist');
      cy.getByLabel(trainingCourseName).click();

      // Click Continue
      cy.get('[data-testid="continue-button"]').click();

      // Assert navigation
      cy.url().should('include', `matching-layout`);
      cy.contains('button', 'Save and return').click();

      cy.get('h1').should('contain', 'Training and qualifications');
      cy.get('[data-testid="workerNameAndRole"]').should('contain', workerName1);
      cy.get('app-alert span').should('contain', 'Training record updated');

      // verify that the training record has picked up training course details
      cy.get('a').contains(trainingCourseName).click();
      cy.get('h1').should('contain', 'Training record details');
      expectTrainingRecordPageToHaveCourseDetails({
        ...trainingCourseDetails,
        courseName: trainingCourseName,
        completedDate: '2025-03-30',
        expiryDate: '2026-03-30',
      });
    });

    it('should allow updating the expiry date, completion date and notes for a training record that is linked to a course', () => {
      cy.addWorkerTrainingLinkedToCourse({
        establishmentID: StandAloneEstablishment.id,
        workerName: workerName1,
        categoryId: 1,
        trainingCourseName,
        trainingTitle: trainingCourseName,
        completedDate: '2025-03-30',
      });

      cy.reload();

      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', trainingCourseName).click();

      cy.get('h1').should('contain', 'Training record details');

      cy.get('[data-testid="completedDate"]').within(() => {
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2025);
      });

      cy.get('[data-testid="expiresDate"]').within(() => {
        cy.getByLabel('Day').clear().type(1);
        cy.getByLabel('Month').clear().type(4);
        cy.getByLabel('Year').clear().type(2026);
      });

      cy.contains('button', 'Open notes').click();
      cy.get('[data-testid="notesSection"]').clear().type('Some notes about training record');
      cy.contains('button', 'Save and return').click();

      cy.get('h1').should('contain', 'Training and qualifications');
      cy.get('[data-testid="workerNameAndRole"]').should('contain', workerName1);
      cy.get('app-alert span').should('contain', 'Training record updated');

      // verify that the updates are saved
      cy.get('a').contains(trainingCourseName).click();
      cy.get('h1').should('contain', 'Training record details');

      expectTrainingRecordPageToHaveCourseDetails({
        courseName: trainingCourseName,
        completedDate: '2025-03-31',
        expiryDate: '2026-04-01',
        notes: 'Some notes about training record',
      });
    });

    it('should be able to change to another training course', () => {
      cy.addWorkerTrainingLinkedToCourse({
        establishmentID: StandAloneEstablishment.id,
        workerName: workerName1,
        categoryId: 1,
        trainingCourseName,
        trainingTitle: trainingCourseName,
        completedDate: '2025-03-30',
      });

      cy.reload();

      cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
      cy.contains('a', trainingCourseName).click();

      cy.contains('Select a different training course').click();

      cy.get('h1').should('contain', 'Select a training course');
      cy.getByLabel(anotherTrainingCourseName).click();
      cy.get('button').contains('Continue').click();

      cy.url().should('include', `matching-layout`);
      cy.contains('button', 'Save and return').click();

      cy.get('h1').should('contain', 'Training and qualifications');
      cy.get('[data-testid="workerNameAndRole"]').should('contain', workerName1);
      cy.get('app-alert span').should('contain', 'Training record updated');

      // verify that the training record has picked up the details of another training course
      cy.get('a').contains(anotherTrainingCourseName).click();
      cy.get('h1').should('contain', 'Training record details');
      expectTrainingRecordPageToHaveCourseDetails({
        ...anotherTrainingCourse,
        courseName: anotherTrainingCourseName,
        completedDate: '2025-03-30',
      });
    });
  });

  describe('multiple training records', () => {
    beforeEach(() => {
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName2 });
      cy.deleteTestWorkerFromDb(workerName2);
      cy.insertTestWorker({ establishmentID, workerName: workerName2 });
    });
    describe('When there are no saved training course', () => {
      before(() => {
        cy.deleteAllTrainingCourses(establishmentID);
      });
      it('should add successfully when there are no saved training courses', () => {
        cy.contains('button', 'Add and manage training').click();
        cy.contains('a', 'Add multiple training records').click();

        // select staff
        cy.contains('Select all those who you want to add a record for');
        cy.get('[class="govuk-summary-list__row"]').contains(workerName1).as('selectedWorker1');
        cy.get('@selectedWorker1').siblings().contains('a', 'Select').click();
        cy.get('@selectedWorker1').siblings().contains('Deselect');

        cy.get('[class="govuk-summary-list__row"]').contains(workerName2).as('selectedWorker2');
        cy.get('@selectedWorker2').siblings().contains('a', 'Select').click();
        cy.get('@selectedWorker2').siblings().contains('Deselect');

        cy.get('[class="asc-records-count"]').contains('2');

        cy.contains('button', 'Continue').click();

        // select training category
        cy.contains('button', 'Show all categories').click();
        cy.getByLabel(trainingCategory).click();
        cy.contains('button', 'Continue').click();

        // add training record details
        cy.get('[data-testid="trainingCategoryDisplay"]').as('trainingCategoryDisplay');
        cy.get('@trainingCategoryDisplay').contains('Training category');
        cy.get('@trainingCategoryDisplay').contains(trainingCategory);
        cy.get('@trainingCategoryDisplay').contains('a', 'Change');

        cy.getByLabel('Training record name').clear().type(trainingName);
        cy.get('#accredited-yes').check().should('be.checked');
        cy.get('#deliveredBy-ExternalProvider').check().should('be.checked');
        cy.get('#conditional-external-provider-name').should('not.have.class', 'govuk-radios__conditional--hidden');
        cy.getByLabel('Provider name').type('Care skills academy');
        cy.get('#howWasItDelivered-FaceToFace').check().should('be.checked');
        cy.get('#validity-period').clear().type('12');
        cy.get('#doesNotExpire').check().should('be.checked');

        cy.get('[data-testid="completedDate"]').within(() => {
          cy.getByLabel('Day').clear().type(31);
          cy.getByLabel('Month').clear().type(3);
          cy.getByLabel('Year').clear().type(2025);
        });

        cy.contains('button', 'Open notes').click();
        cy.get('[data-testid="notesSection"]').clear().type('Group training');
        cy.contains('button', 'Continue').click();

        // Summary
        cy.contains(workerName1);
        cy.contains(workerName2);
        cy.contains(trainingCategory);
        cy.contains('button', 'Save training records').click();

        // staff training and qualifications page
        cy.get('[data-testid="generic_alert"]').contains('2 training records added');
      });
    });

    describe('with training courses', () => {
      before(() => {
        cy.deleteAllTrainingCourses(establishmentID);
        cy.insertTrainingCourse({
          establishmentID,
          categoryId: 1,
          name: trainingCourseName,
          validityPeriodInMonth: 12,
        });
        cy.reload();
      });

      after(() => {
        cy.deleteAllTrainingCourses(establishmentID);
      });

      it('should add successfully when no training courses are picked', () => {
        cy.contains('button', 'Add and manage training').click();
        cy.contains('a', 'Add multiple training records').click();

        // select staff
        cy.contains('Select all those who you want to add a record for');
        cy.get('[class="govuk-summary-list__row"]').contains(workerName1).as('selectedWorker1');
        cy.get('@selectedWorker1').siblings().contains('a', 'Select').click();
        cy.get('@selectedWorker1').siblings().contains('Deselect');

        cy.get('[class="govuk-summary-list__row"]').contains(workerName2).as('selectedWorker2');
        cy.get('@selectedWorker2').siblings().contains('a', 'Select').click();
        cy.get('@selectedWorker2').siblings().contains('Deselect');

        cy.get('[class="asc-records-count"]').contains('2');

        cy.contains('button', 'Continue').click();

        // select training courses
        cy.get('h1').should('contain', 'How do you want to continue');
        cy.getByLabel('Continue without selecting a training course').click();
        cy.contains('button', 'Continue').click();

        // select training category
        cy.contains('button', 'Show all categories').click();
        cy.getByLabel(trainingCategory).click();
        cy.contains('button', 'Continue').click();

        cy.get('[data-testid="trainingCategoryDisplay"]').as('trainingCategoryDisplay');
        cy.get('@trainingCategoryDisplay').contains('Training category');
        cy.get('@trainingCategoryDisplay').contains(trainingCategory);
        cy.get('@trainingCategoryDisplay').contains('a', 'Change');

        cy.getByLabel('Training record name').clear().type(trainingName);
        cy.get('#accredited-yes').check().should('be.checked');
        cy.get('#deliveredBy-ExternalProvider').check().should('be.checked');
        cy.get('#conditional-external-provider-name').should('not.have.class', 'govuk-radios__conditional--hidden');
        cy.getByLabel('Provider name').type('Care skills academy');
        cy.get('#howWasItDelivered-FaceToFace').check().should('be.checked');
        cy.get('#validity-period').clear().type('12');
        cy.get('#doesNotExpire').check().should('be.checked');

        cy.get('[data-testid="completedDate"]').within(() => {
          cy.getByLabel('Day').clear().type(31);
          cy.getByLabel('Month').clear().type(3);
          cy.getByLabel('Year').clear().type(2025);
        });

        cy.contains('button', 'Open notes').click();
        cy.get('[data-testid="notesSection"]').clear().type('Group training');
        cy.contains('button', 'Continue').click();

        // Summary
        cy.contains(workerName1);
        cy.contains(workerName2);
        cy.contains(trainingCategory);
        cy.contains('button', 'Save training records').click();

        // staff training and qualifications page
        cy.get('[data-testid="generic_alert"]').contains('2 training records added');
      });

      it('should add successfully when a training courses is picked', () => {
        cy.contains('button', 'Add and manage training').click();
        cy.contains('a', 'Add multiple training records').click();

        // select staff
        cy.contains('Select all those who you want to add a record for');
        cy.get('[class="govuk-summary-list__row"]').contains(workerName1).as('selectedWorker1');
        cy.get('@selectedWorker1').siblings().contains('a', 'Select').click();
        cy.get('@selectedWorker1').siblings().contains('Deselect');

        cy.get('[class="govuk-summary-list__row"]').contains(workerName2).as('selectedWorker2');
        cy.get('@selectedWorker2').siblings().contains('a', 'Select').click();
        cy.get('@selectedWorker2').siblings().contains('Deselect');

        cy.get('[class="asc-records-count"]').contains('2');

        cy.contains('button', 'Continue').click();

        // select training courses
        cy.get('h1').should('contain', 'How do you want to continue');
        cy.getByLabel(trainingCourseName).click();
        cy.contains('button', 'Continue').click();

        // check training course details
        cy.url().should('include', 'add-multiple-training/view-selected-training-course-details');
        cy.get('h1').should('contain', 'Add training record details');

        // add course completion date
        cy.getByLabel('Day').clear().type(31);
        cy.getByLabel('Month').clear().type(3);
        cy.getByLabel('Year').clear().type(2025);

        // add notes
        cy.contains('button', 'Open notes').click();
        cy.get('[data-testid="notesSection"]').clear().type('Group training');

        cy.contains('button', 'Continue').click();

        // final summary and submit page in journey
        cy.url().should('include', 'add-multiple-training/confirm-training-record-details');
        cy.get('h1').should('contain', 'Summary');

        cy.contains('button', 'Save training records').click();

        // staff training and qualifications page
        cy.get('[data-testid="generic_alert"]').contains('2 training records added');

        //check dates have been saved correctly
        cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
        cy.contains('a', trainingCourseName).click();

        cy.get('[data-testid="completedDate"]').within(() => {
          cy.getByLabel('Day').clear().type(31);
          cy.getByLabel('Month').clear().type(3);
          cy.getByLabel('Year').clear().type(2025);
        });

        cy.get('[data-testid="expiresDate"]').within(() => {
          cy.getByLabel('Day').clear().type(31);
          cy.getByLabel('Month').clear().type(3);
          cy.getByLabel('Year').clear().type(2026);
        });
      });
    });
  });

  describe('missing mandatory training warning', () => {
    const workerName = 'worker to test mandatory training';
    const jobID = 11;
    const categoryIdForAutism = 2;
    const categoryIdForCommunication = 4;

    before(() => {
      cy.deleteWorkerTrainingRecord({ workerName, establishmentID });
      cy.deleteTestWorkerFromDb(workerName);
      cy.removeAllMandatoryTrainings(establishmentID);
      cy.insertTestWorker({ establishmentID, workerName, mainJobFKValue: jobID });
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({
        establishmentID,
        categoryId: categoryIdForCommunication,
        name: 'Communication course',
      });

      cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForAutism, jobID });
      cy.insertMandatoryTraining({ establishmentID, trainingCategoryID: categoryIdForCommunication, jobID });
    });

    after(() => {
      cy.deleteWorkerTrainingRecord({ workerName, establishmentID });
      cy.deleteTestWorkerFromDb(workerName);
    });

    it('should show a warning and an Add link for each missing mandatory training of a worker', () => {
      onHomePage.clickTab('Training and qualifications');
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

  describe('expired training warnings', () => {
    const workerName = 'worker to test expired training';
    const jobID = 11;
    const categoryIdForAutism = 2;
    const categoryIdForCommunication = 4;

    before(() => {
      cy.deleteWorkerTrainingRecord({ workerName, establishmentID });
      cy.deleteTestWorkerFromDb(workerName);
      cy.insertTestWorker({ establishmentID, workerName, mainJobFKValue: jobID });
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({
        establishmentID,
        categoryId: categoryIdForCommunication,
        name: 'Communication course',
      });

      cy.addWorkerTraining({
        establishmentID,
        workerName,
        categoryId: categoryIdForAutism,
        trainingTitle: 'Autism training',
        completedDate: '2020-01-01',
        expiryDate: '2021-01-01',
      });

      cy.addWorkerTrainingLinkedToCourse({
        establishmentID,
        workerName,
        categoryId: categoryIdForCommunication,
        trainingCourseName: 'Communication course',
        trainingTitle: 'Communication course',
        completedDate: '2020-06-01',
        expiryDate: '2021-06-01',
      });
    });

    after(() => {
      cy.deleteWorkerTrainingRecord({ workerName, establishmentID });
      cy.deleteTestWorkerFromDb(workerName);
    });

    it('should show a warning and an Update link for each expired training of a worker', () => {
      onHomePage.clickTab('Training and qualifications');
      cy.contains('a', '2 records have expired').should('be.visible').as('expiryWarning');
      cy.get('@expiryWarning').click();

      cy.get('h1').should('contain', 'Expired training records');

      // if training record is not linked to a course, Update link should lead to old style edit training page
      clickUpdateLinkForRow('Autism');
      cy.get('h1').should('contain', 'Training record details');
      cy.url().should('contain', 'edit-training-without-course');
      cy.getByLabel('Training record name').should('have.value', 'Autism training');

      cy.contains('a', 'Back').click();

      // if training record is linked to a course, Update link should lead to course details page
      clickUpdateLinkForRow('Communication');
      cy.get('h1').should('contain', 'Training record details');
      cy.url().should('contain', 'edit-training-with-course');
      expectTrainingRecordPageToHaveCourseDetails({
        courseName: 'Communication course',
        completedDate: '2020-06-01',
        expiryDate: '2021-06-01',
      });
    });

    it('should show expiry warnings and Update links in the Action list', () => {
      onHomePage.clickTab('Training and qualifications');
      clickIntoWorkerTAndQRecordPage(workerName);
      cy.contains('table', 'Actions list').within(() => {
        cy.contains('Autism').should('be.visible');
        cy.contains('Communication').should('be.visible');
      });

      // if training record is not linked to a course, Update link should lead to old style edit training page
      clickUpdateLinkForRow('Autism');
      cy.get('h1').should('contain', 'Training record details');
      cy.url().should('contain', 'edit-training-without-course');
      cy.getByLabel('Training record name').should('have.value', 'Autism training');

      cy.contains('a', 'Back').click();

      // if training record is linked to a course, Update link should lead to course details page
      clickUpdateLinkForRow('Communication');
      cy.get('h1').should('contain', 'Training record details');
      cy.url().should('contain', 'edit-training-with-course');
      expectTrainingRecordPageToHaveCourseDetails({
        courseName: 'Communication course',
        completedDate: '2020-06-01',
        expiryDate: '2021-06-01',
      });
    });
  });
});
