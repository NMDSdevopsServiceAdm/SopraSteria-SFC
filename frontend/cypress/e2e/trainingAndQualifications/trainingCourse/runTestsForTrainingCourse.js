/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../support/page_objects/onHomePage';
import {
  clickIntoAddAndManageTrainingCourses,
  clickIntoTrainingCourse,
  clickIntoWorkerTAndQRecordPage,
  expectPageToHaveDetails,
  expectTrainingRecordPageToHaveCourseDetails,
  fillInCourseDetails,
} from './helpers';

export const runTestsForTrainingCourseJourney = (mockEstablishmentData) => {
  describe('Add and manage training course', () => {
    const establishmentID = mockEstablishmentData.id;
    const workerName = 'test worker for training course';

    before(() => {
      cy.unlinkAllWorkerTrainingFromCourse();
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({ establishmentID, categoryId: 1, name: 'Test training course' });
      cy.insertTestWorker({ establishmentID, workerName });
    });

    after(() => {
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteTestWorkerFromDb(workerName);
      cy.deleteAllTrainingCourses(establishmentID);
    });

    it('should be able to visit "Add and manage training course" page from training and qualification tab', () => {
      clickIntoAddAndManageTrainingCourses();
      cy.get('[data-testid="training-course-table"]')
        .as('training-course-table')
        .should('contain.text', 'Test training course');
    });

    it('should be able to add a new training course', () => {
      const newCourseDetails = {
        courseName: 'Test add new training course',
        accredited: 'No',
        deliveredBy: 'In-house staff',
        howWasItDelivered: 'E-learning',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      };

      onHomePage.clickTab('Training and qualifications');
      cy.contains('Add and manage training').click();
      cy.get('a').contains('Add training courses').click();

      cy.get('a').contains('Add a training course').click();

      cy.get('h1').should('contain', 'Add training course details');

      fillInCourseDetails(newCourseDetails);

      cy.get('button').contains('Continue').click();

      cy.get('h1').should('contain', 'Select a category that best matches this training course');

      cy.contains('Show all categories').click();
      cy.getByLabel('Medication management').click();
      cy.get('button').contains('Save training course').click();

      cy.get('h1').should('contain', 'Add and manage training courses');
      cy.get('app-alert span').should('contain', 'Training course added');

      // Verify that the training course details is same as added
      cy.get('[data-testid="training-course-table"]').should('contain.text', newCourseDetails.courseName);
      clickIntoTrainingCourse(newCourseDetails.courseName);
      expectPageToHaveDetails(newCourseDetails);
    });

    describe('edit training course', () => {
      const confirmationPageHeading = 'Select which training records you want the updated course details to apply to?';
      const radioLabels = {
        onlyNew: 'Only apply the updated course details to NEW training records that you add in the future',
        existingAndNew: 'Apply the updated course details to EXISTING and NEW training records',
      };
      const trainingCourseName = 'Test linked training course';
      const trainingRecordTitle = 'Test training record linked to course';
      const workerName = 'Test worker for linked training course';

      beforeEach(() => {
        cy.insertTrainingCourse({ establishmentID, categoryId: 1, name: trainingCourseName });

        cy.insertTestWorker({ establishmentID, workerName });
        cy.addWorkerTrainingLinkedToCourse({
          establishmentID,
          workerName,
          categoryId: 1,
          trainingCourseName,
          trainingTitle: trainingRecordTitle,
        });
      });

      afterEach(() => {
        cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
        cy.deleteTestWorkerFromDb(workerName);
        cy.deleteAllTrainingCourses(establishmentID);
      });

      const changedCourseDetails = {
        courseName: 'Changed course name',
        categoryName: 'Medication management',
        accredited: 'No',
        deliveredBy: 'External provider',
        providerName: 'Care skill academy',
        howWasItDelivered: 'Face to face',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
      };

      it('should be able to edit a training course and apply the change to linked training records', () => {
        clickIntoAddAndManageTrainingCourses();

        clickIntoTrainingCourse(trainingCourseName);
        cy.get('h1').should('contain', 'Training course details');
        cy.getByLabel('Training course name').should('have.value', trainingCourseName);

        // change category
        cy.get('a').contains('Change').click();
        cy.get('button').contains('Show all categories').click();
        cy.getByLabel(changedCourseDetails.categoryName).click();
        cy.get('button').contains('Continue').click();

        // fill in other details
        cy.get('h1').should('contain', 'Training course details');
        fillInCourseDetails(changedCourseDetails);
        cy.get('button').contains('Continue').click();

        cy.getByLabel(radioLabels.existingAndNew).click();

        cy.get('button').contains('Apply and save').click();

        cy.get('h1').should('contain', 'Add and manage training courses for your workplace');
        cy.get('app-alert span').should(
          'contain',
          'Course details updated and will apply to EXISTING and NEW training records',
        );

        // Verify that the training course details is changed
        clickIntoTrainingCourse(changedCourseDetails.courseName);
        cy.get('h1').should('contain', 'Training course details');
        expectPageToHaveDetails(changedCourseDetails);
        cy.get('[data-testid="training-category"]').should('contain', changedCourseDetails.categoryName);

        // Verify that the change to training course is applied to the linked training record
        clickIntoWorkerTAndQRecordPage(workerName);

        cy.get('a').contains(trainingRecordTitle).should('not.exist');
        cy.get('a').contains(changedCourseDetails.courseName).should('exist');

        cy.contains('a', changedCourseDetails.courseName).click();

        expectTrainingRecordPageToHaveCourseDetails(changedCourseDetails);
      });

      it('should be able to edit the training course only', () => {
        clickIntoAddAndManageTrainingCourses();

        clickIntoTrainingCourse(trainingCourseName);
        cy.get('h1').should('contain', 'Training course details');
        cy.getByLabel('Training course name').should('have.value', trainingCourseName);

        // change category
        cy.get('a').contains('Change').click();
        cy.get('button').contains('Show all categories').click();
        cy.getByLabel(changedCourseDetails.categoryName).click();
        cy.get('button').contains('Continue').click();

        // fill in other details
        cy.get('h1').should('contain', 'Training course details');
        fillInCourseDetails(changedCourseDetails);
        cy.get('button').contains('Continue').click();

        cy.get('h1').should('contain', confirmationPageHeading);

        cy.getByLabel(radioLabels.onlyNew).click();

        cy.get('button').contains('Apply and save').click();

        cy.get('h1').should('contain', 'Add and manage training courses for your workplace');
        cy.get('app-alert span').should('contain', 'Course details updated and will apply to NEW training records');

        // Verify that the training course details is changed
        clickIntoTrainingCourse(changedCourseDetails.courseName);
        cy.get('h1').should('contain', 'Training course details');
        expectPageToHaveDetails(changedCourseDetails);
        cy.get('[data-testid="training-category"]').should('contain', changedCourseDetails.categoryName);

        // Verify that the linked training record is not changed
        clickIntoWorkerTAndQRecordPage(workerName);

        cy.get('a').contains(changedCourseDetails.courseName).should('not.exist');
        cy.get('a').contains(trainingRecordTitle).should('exist');
      });
    });

    describe('Remove training course', () => {
      const trainingCourseName = 'Test remove training course';

      before(() => {
        cy.deleteAllTrainingCourses(establishmentID);
        cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: trainingCourseName });
      });

      it('should be able to remove a training course', () => {
        clickIntoAddAndManageTrainingCourses();

        cy.contains('a', trainingCourseName).should('be.visible');
        cy.get(`tr:contains("${trainingCourseName}")`).contains('Remove').click();

        cy.url().should('include', '/remove');

        cy.get('[data-testid="heading"]').contains('What happens when you remove a training course?');

        cy.contains(`Training course name: ${trainingCourseName}`).should('exist');

        cy.contains('Remove this training course').click();
        cy.url().should('include', '/add-and-manage-training-courses');
        cy.get('app-alert span').contains('Training course removed').should('be.visible');

        cy.contains('a', trainingCourseName).should('not.exist');
      });
    });

    describe('Remove all training courses', () => {
      const trainingCourseNames = [
        'Test remove training course A',
        'Test remove training course B',
        'Test remove training course C',
      ];
      const trainingRecordTitle = 'Test training record linked to course';

      before(() => {
        cy.deleteAllTrainingCourses(establishmentID);
        trainingCourseNames.forEach((trainingCourseName) => {
          cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: trainingCourseName });
        });

        cy.addWorkerTrainingLinkedToCourse({
          establishmentID,
          workerName,
          categoryId: 1,
          trainingCourseName: trainingCourseNames[0],
          trainingTitle: trainingRecordTitle,
        });
      });

      it('should be able to remove all training courses', () => {
        clickIntoAddAndManageTrainingCourses();

        trainingCourseNames.forEach((trainingCourseName) => {
          cy.contains('a', trainingCourseName).should('be.visible');
        });

        cy.get('a').contains('Remove all').click();

        cy.url().should('include', '/remove');

        cy.get('h1').contains('What happens when you remove all training courses?');

        cy.get('[data-testid="training-courses"]').within(() => {
          trainingCourseNames.forEach((trainingCourseName) => {
            cy.contains(trainingCourseName).should('be.visible');
          });
        });

        cy.get('button').contains('Remove all training courses').click();
        cy.url().should('include', '/add-and-manage-training-courses');
        cy.get('app-alert span').contains('Training courses removed').should('be.visible');

        trainingCourseNames.forEach((trainingCourseName) => {
          cy.contains('a', trainingCourseName).should('not.exist');
        });

        // verify that linked training record is not deleted
        clickIntoWorkerTAndQRecordPage(workerName);
        cy.get('a').contains(trainingRecordTitle).should('exist');
      });
    });
  });
};
