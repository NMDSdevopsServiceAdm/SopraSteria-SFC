import { onHomePage } from '../../../support/page_objects/onHomePage';

export const runTestsForUpdateTrainingRecordsWithCourseDetails = (mockEstablishmentData) => {
  describe('Update records with training course details', () => {
    const establishmentID = mockEstablishmentData.id;
    const workerName = 'test worker for training course';
    const trainingCourseWithLinkableRecords = 'training course with linkable records';
    const trainingCourseWithoutLinkableRecords = 'training course without linkable records';

    const mockTrainingRecordTitle = 'Test update training records with course details';

    before(() => {
      cy.unlinkAllWorkerTrainingFromCourse();
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName });
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({ establishmentID, categoryId: 1, name: trainingCourseWithLinkableRecords });
      cy.insertTrainingCourse({ establishmentID, categoryId: 2, name: trainingCourseWithoutLinkableRecords });
      cy.insertTestWorker({ establishmentID, workerName });

      [1, 2, 3].forEach(() => {
        cy.addWorkerTraining({
          establishmentID,
          workerName: workerName,
          categoryId: 1,
          trainingTitle: mockTrainingRecordTitle,
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

      cy.get('a').contains(trainingCourseWithLinkableRecords).should('be.visible');

      // should show a plain text but not a link, for courses that have no records to link to
      cy.get('a').contains(trainingCourseWithoutLinkableRecords).should('not.exist');
      cy.get('td').contains(trainingCourseWithoutLinkableRecords).should('be.visible');
    });

    it('should be able to update multiple training records with training course details', () => {
      onHomePage.clickTab('Training and qualifications');
      cy.contains('Add and manage training').click();
      cy.get('a').contains('Update records with training course details').click();

      cy.get('a').contains(trainingCourseWithLinkableRecords).click();

      cy.get('h1').should('contain', 'Select the training records that you want to update');
      cy.getByLabel(`${mockTrainingRecordTitle} (3 records)`).check();
      cy.get('button').contains('Continue').click();

      // #TODO: to be continue in ticket #1843
    });
  });
};
