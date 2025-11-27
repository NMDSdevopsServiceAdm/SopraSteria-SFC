/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../support/page_objects/onHomePage';

export const runTestsForTrainingCourseJourney = (mockEstablishmentData) => {
  describe('Add and manage training course', () => {
    const establishmentID = mockEstablishmentData.id;
    const workerName = 'test worker for training course';

    before(() => {
      cy.unlinkAllWorkerTrainingFromCourse();
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: 'Test training course' });
      cy.insertTestWorker({ establishmentID, workerName });
    });

    after(() => {
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteTestWorkerFromDb(workerName);
      cy.deleteAllTrainingCourses(establishmentID);
    });

    it('should be able to visit "Add and manage training course" page from training and qualification tab', () => {
      onHomePage.clickTab('Training and qualifications');
      cy.contains('Add and manage training').click();
      cy.get('a').contains('Add and manage training courses').click();

      cy.get('h1').should('contain.text', 'Add and manage training courses for your workplace');
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
      cy.get('a').contains('Add and manage training courses').click();

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
        cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: trainingCourseName });

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

      const changedCourseDetail = {
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
        onHomePage.clickTab('Training and qualifications');
        cy.contains('Add and manage training').click();
        cy.get('a').contains('Add and manage training courses').click();
        cy.get('h1').should('contain', 'Add and manage training courses');

        clickIntoTrainingCourse(trainingCourseName);
        cy.get('h1').should('contain', 'Training course details');
        cy.getByLabel('Training course name').should('have.value', trainingCourseName);

        // change category
        cy.get('a').contains('Change').click();
        cy.get('button').contains('Show all categories').click();
        cy.getByLabel(changedCourseDetail.categoryName).click();
        cy.get('button').contains('Continue').click();

        // fill in other details
        cy.get('h1').should('contain', 'Training course details');
        fillInCourseDetails(changedCourseDetail);
        cy.get('button').contains('Continue').click();

        cy.getByLabel(radioLabels.existingAndNew).click();

        cy.get('button').contains('Apply and save').click();

        cy.get('h1').should('contain', 'Add and manage training courses for your workplace');
        cy.get('app-alert span').should(
          'contain',
          'Course details updated and will apply to EXISTING and NEW training records',
        );

        // Verify that the training course details is changed
        clickIntoTrainingCourse(changedCourseDetail.courseName);
        cy.get('h1').should('contain', 'Training course details');
        expectPageToHaveDetails(changedCourseDetail);
        cy.get('[data-testid="training-category"]').should('contain', changedCourseDetail.categoryName);

        // Verify that the change to training course is applied to the linked training record
        cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
        cy.get('[data-testid="training-worker-table"]').contains(workerName).click();

        cy.get('a').contains(trainingRecordTitle).should('not.exist');
        cy.get('a').contains(changedCourseDetail.courseName).should('exist');

        cy.contains('a', changedCourseDetail.courseName).click();

        cy.get('[data-testid="trainingCategoryDisplay"]').should('contain', changedCourseDetail.categoryName);
        expectPageToHaveDetails({
          ...changedCourseDetail,
          trainingRecordTitle: changedCourseDetail.courseName,
          courseName: null,
        });
      });

      it('should be able to edit the training course only', () => {
        onHomePage.clickTab('Training and qualifications');
        cy.contains('Add and manage training').click();
        cy.get('a').contains('Add and manage training courses').click();
        cy.get('h1').should('contain', 'Add and manage training courses');

        clickIntoTrainingCourse(trainingCourseName);
        cy.get('h1').should('contain', 'Training course details');
        cy.getByLabel('Training course name').should('have.value', trainingCourseName);

        // change category
        cy.get('a').contains('Change').click();
        cy.get('button').contains('Show all categories').click();
        cy.getByLabel(changedCourseDetail.categoryName).click();
        cy.get('button').contains('Continue').click();

        // fill in other details
        cy.get('h1').should('contain', 'Training course details');
        fillInCourseDetails(changedCourseDetail);
        cy.get('button').contains('Continue').click();

        cy.get('h1').should('contain', confirmationPageHeading);

        cy.getByLabel(radioLabels.onlyNew).click();

        cy.get('button').contains('Apply and save').click();

        cy.get('h1').should('contain', 'Add and manage training courses for your workplace');
        cy.get('app-alert span').should('contain', 'Course details updated and will apply to NEW training records');

        // Verify that the training course details is changed
        clickIntoTrainingCourse(changedCourseDetail.courseName);
        cy.get('h1').should('contain', 'Training course details');
        expectPageToHaveDetails(changedCourseDetail);
        cy.get('[data-testid="training-category"]').should('contain', changedCourseDetail.categoryName);

        // Verify that the linked training record is not changed
        cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
        cy.get('[data-testid="training-worker-table"]').contains(workerName).click();
        cy.get('a').contains(changedCourseDetail.courseName).should('not.exist');
        cy.get('a').contains(trainingRecordTitle).should('exist');
      });
    });

    // helper functions below

    const clickIntoTrainingCourse = (courseName) => {
      cy.get('a').not(':contains("Remove")').contains(courseName).click();
    };

    const fillInCourseDetails = (courseDetails) => {
      const {
        courseName,
        accredited,
        deliveredBy,
        providerName,
        howWasItDelivered,
        doesNotExpire,
        validityPeriodInMonth,
      } = courseDetails;

      cy.getByLabel('Training course name').as('courseName').clear();
      cy.get('@courseName').type(courseName);
      const accreditedLabel = accredited === "Don't know" ? 'I do not know' : accredited;
      cy.getByLabel(accreditedLabel).click();
      cy.getByLabel(deliveredBy).click();

      if (deliveredBy === 'External provider') {
        cy.getByLabel('Provider name').as('providerName').clear();
        cy.get('@providerName').type(providerName);
      }

      cy.getByLabel(howWasItDelivered).click();

      if (doesNotExpire) {
        cy.getByLabel('This training does not expire').click();
      } else {
        cy.getByLabel(/How many months/).type(validityPeriodInMonth);
      }
    };

    const expectPageToHaveDetails = (details) => {
      const {
        courseName,
        trainingRecordTitle,
        accredited,
        deliveredBy,
        providerName,
        howWasItDelivered,
        doesNotExpire,
        validityPeriodInMonth,
      } = details;

      if (courseName) {
        cy.getByLabel('Training course name').should('have.value', courseName);
      } else if (trainingRecordTitle) {
        cy.getByLabel('Training record name').should('have.value', trainingRecordTitle);
      }

      const accreditedLabel = accredited === "Don't know" ? 'I do not know' : accredited;
      cy.getByLabel(accreditedLabel).should('be.checked');
      cy.getByLabel(deliveredBy).should('be.checked');

      if (deliveredBy === 'External provider') {
        cy.getByLabel('Provider name').should('have.value', providerName);
      }

      cy.getByLabel(howWasItDelivered).should('be.checked');

      if (doesNotExpire) {
        cy.getByLabel('This training does not expire').should('be.checked');
      } else {
        cy.getByLabel(/How many months/).should('have.value', validityPeriodInMonth.toString());
      }
    };
  });
};
