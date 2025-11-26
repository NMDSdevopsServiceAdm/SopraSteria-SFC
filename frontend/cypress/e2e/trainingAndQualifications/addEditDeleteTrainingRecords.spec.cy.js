/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

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

  it('should add successfully when there are no saved training courses', () => {
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
    cy.get('#external-provider-name').type('Care skills academy');
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

  describe('training courses', () => {
    before(() => {
      cy.deleteAllTrainingCourses(establishmentID);
      cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: trainingCourseName });
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

      // this needs finishing once the journey is complete
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
    cy.get('#external-provider-name').type('Care skills academy');
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

  describe('including training course details', () => {
    beforeEach(() => {
      cy.addWorkerTraining({ establishmentID: StandAloneEstablishment.id, workerName: workerName1, categoryId: 1 });
      cy.insertTrainingCourse({ establishmentID: StandAloneEstablishment.id, categoryId: 1 });
      cy.reload();
    });

    afterEach(() => {
      cy.deleteAllTrainingCourses(establishmentID);
    });

    describe('when there is one training course that matches the training record', () => {
      it('should include training course details successfully', () => {
        cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
        cy.contains('a', trainingName).click();

        cy.contains('a', 'Include training course details').click();
        cy.get('[data-testid="workerName"]').contains(workerName1);
        cy.get('[data-testid="checkbox-label"]').contains('Test training course');
        cy.get('[data-testid="training-course-name-checkbox"]').check();
        // Add test for clicking on Continue button when that functionality is added
      });
    });

    describe('when there are multiple training course that match the training record', () => {
      it('should include training course details successfully', () => {
        cy.insertTrainingCourse({
          establishmentID: StandAloneEstablishment.id,
          categoryId: 1,
          name: 'Test training course 2',
        });
        cy.reload();

        cy.get('[data-testid="training-worker-table"]').contains(workerName1).click();
        cy.contains('a', trainingName).click();

        cy.contains('a', 'Include training course details').click();
        cy.get('[data-testid="workerName"]').contains(workerName1);
        cy.contains('label', 'Test training course');
        cy.contains('label', 'Test training course 2');
        // Add test for selecting and clicking on Continue button when that functionality is added
      });
    });
  });

  describe('multiple training records', () => {
    beforeEach(() => {
      cy.deleteWorkerTrainingRecord({ establishmentID, workerName: workerName2 });
      cy.deleteTestWorkerFromDb(workerName2);
      cy.insertTestWorker({ establishmentID, workerName: workerName2 });
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
      cy.get('#external-provider-name').type('Care skills academy');
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

    describe('with training courses', () => {
      before(() => {
        cy.deleteAllTrainingCourses(establishmentID);
        cy.insertTrainingCourse({ establishmentID, categoryID: 1, name: trainingCourseName });
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
        cy.get('#external-provider-name').type('Care skills academy');
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

        // to update when the journey is complete
      });
    });
  });
});
