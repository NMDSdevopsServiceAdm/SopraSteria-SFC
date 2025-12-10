import { onHomePage } from '../../../support/page_objects/onHomePage';
import { clickIntoWorkerTAndQRecordPage, expectPageToHaveDetails } from './helpers';

export const runTestsForUpdateTrainingRecordsWithCourseDetails = (mockEstablishmentData) => {
  describe('Update records with training course details', () => {
    const establishmentID = mockEstablishmentData.id;
    const workerName = 'test worker for training course';
    const trainingCourseName = 'training course with linkable records';
    const trainingCourseWithoutLinkableRecords = 'training course without linkable records';

    const traininCourseDetails = {
      accredited: 'No',
      deliveredBy: 'In-house staff',
      howWasItDelivered: 'E-learning',
      doesNotExpire: false,
      validityPeriodInMonth: 24,
    };

    const titleA = 'Test update training records with course details A';
    const titleB = 'Test update training records with course details B';
    const mockTraininRecords = [titleA, titleB, titleA, titleB, titleA];
    const mockTrainingRecordCompletedDate = '2025-01-01';

    before(() => {
      cy.unlinkAllWorkerTrainingFromCourse();
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({
        establishmentID,
        categoryId: 1,
        name: trainingCourseName,
        ...traininCourseDetails,
      });
      cy.insertTrainingCourse({
        establishmentID,
        categoryId: 2,
        name: trainingCourseWithoutLinkableRecords,
        ...traininCourseDetails,
      });
      cy.insertTestWorker({ establishmentID, workerName });

      mockTraininRecords.forEach((title) => {
        cy.addWorkerTraining({
          establishmentID,
          workerName: workerName,
          categoryId: 1,
          trainingTitle: title,
          completedDate: mockTrainingRecordCompletedDate,
        });
      });
    });

    after(() => {
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteTestWorkerFromDb(workerName);
      cy.deleteAllTrainingCourses(establishmentID);
    });

    it('should be able to visit "Update records with training course details" page from Training and qualifications tab', () => {
      onHomePage.clickTab('Training and qualifications');
      cy.contains('Add and manage training').click();
      cy.get('a').contains('Update records with training course details').click();

      cy.get('a').contains(trainingCourseName).should('be.visible');

      // should show a plain text but not a link, for courses that have no records to link to
      cy.get('a').contains(trainingCourseWithoutLinkableRecords).should('not.exist');
      cy.get('td').contains(trainingCourseWithoutLinkableRecords).should('be.visible');
    });

    it.only('should be able to update multiple training records with training course details', () => {
      onHomePage.clickTab('Training and qualifications');
      cy.contains('Add and manage training').click();
      cy.get('a').contains('Update records with training course details').click();

      cy.get('a').contains(trainingCourseName).click();

      cy.get('h1').should('contain', 'Select the training records that you want to update');
      cy.getByLabel(`${titleA} (3 records)`).check();
      cy.getByLabel(`${titleB} (2 records)`).check();
      cy.get('button').contains('Continue').click();

      cy.get('h1').should('contain', `You've selected 5 training records to update with course details`);

      cy.get('button').contains('Update training records').click();

      cy.get('h1').should('contain', 'Training and qualifications');

      cy.get('app-alert span').should('contain', '5 training records updated with course details');

      // Verify the chosen training records are updated with the details of the training course
      const expectedTrainingRecordName = trainingCourseName;
      const expectedExpiryDate = '2026-12-31'; // 2025-01-01 + 24 months - 1 day

      clickIntoWorkerTAndQRecordPage(workerName);

      cy.get('a').contains(titleA).should('not.exist');
      cy.get('a').contains(titleB).should('not.exist');
      cy.get('a').filter(`:contains("${expectedTrainingRecordName}")`).should('exist').and('have.length', 5);

      cy.contains('a', expectedTrainingRecordName).click();

      expectPageToHaveDetails({
        ...traininCourseDetails,
        trainingRecordTitle: expectedTrainingRecordName,
        courseName: null,
        completedDate: mockTrainingRecordCompletedDate,
        expiryDate: expectedExpiryDate,
      });
    });
  });
};
