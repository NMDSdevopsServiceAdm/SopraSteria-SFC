import { v4 as uuidv4 } from 'uuid';

Cypress.Commands.add('addWorkerTraining', (args) => {
  const { establishmentID = '180', workerName = 'Test worker', categoryId = 4 } = args;

  cy.getWorkerId(establishmentID, workerName);

  cy.get('@workerId').then((workerId) => {
    const queryString = `INSERT INTO cqc."WorkerTraining"
  ("UID", "WorkerFK", "CategoryFK", "Title", "Completed", "updatedby")
  VALUES ($1, $2, $3, 'Test Training', '2025-01-01', 'admin1')`;

    const parameters = [uuidv4(), workerId, categoryId];

    cy.task('dbQuery', { queryString, parameters });
  });
});

Cypress.Commands.add('addWorkerTrainingLinkedToCourse', (args) => {
  const {
    establishmentID = '180',
    workerName = 'Test worker',
    categoryId = 4,
    trainingCourseName,
    trainingTitle = 'Test Training',
  } = args;

  cy.getWorkerId(establishmentID, workerName);
  cy.getTrainingCourseId(establishmentID, trainingCourseName);

  cy.get('@workerId').then((workerId) => {
    cy.get('@trainingCourseId').then((trainingCourseId) => {
      const queryString = `INSERT INTO cqc."WorkerTraining"
  ("UID", "WorkerFK", "CategoryFK", "TrainingCourseFK", "Title", "Completed", "updatedby")
  VALUES ($1, $2, $3, $4, $5, '2025-01-01', 'admin1')`;
      const parameters = [uuidv4(), workerId, categoryId, trainingCourseId, trainingTitle];
      cy.task('dbQuery', { queryString, parameters });
    });
  });
});

Cypress.Commands.add('deleteWorkerTrainingRecord', (args) => {
  const { establishmentID = '180', workerName = 'Test worker' } = args;

  cy.getWorkerId(establishmentID, workerName);

  cy.get('@workerId').then((workerId) => {
    const queryString = `DELETE FROM cqc."WorkerTraining"
    WHERE "WorkerFK" = $1`;

    const parameters = [workerId];

    cy.task('dbQuery', { queryString, parameters });
  });
});

Cypress.Commands.add('addWorkerQualification', (args) => {
  const { establishmentID = '180', workerName = 'Test worker', qualificationId = 121 } = args;

  cy.getWorkerId(establishmentID, workerName);

  cy.get('@workerId').then((workerId) => {
    const queryString = `INSERT INTO cqc."WorkerQualifications"
  ("UID", "WorkerFK", "QualificationsFK", "Year", "updatedby")
  VALUES ($1, $2, $3, '2024', 'admin1')`;

    const parameters = [uuidv4(), workerId, qualificationId];

    cy.task('dbQuery', { queryString, parameters });
  });
});

Cypress.Commands.add('deleteWorkerQualificationsRecord', (args) => {
  const { establishmentID = '180', workerName = 'Test worker' } = args;

  cy.getWorkerId(establishmentID, workerName);

  cy.get('@workerId').then((workerId) => {
    const queryString = `DELETE FROM cqc."WorkerQualifications"
    WHERE "WorkerFK" = $1`;

    const parameters = [workerId];

    cy.task('dbQuery', { queryString, parameters });
  });
});

Cypress.Commands.add('deleteAllTrainingCourses', (establishmentID) => {
  const queryString = `DELETE FROM cqc."TrainingCourse"
    WHERE "EstablishmentFK" = $1`;

  const parameters = [establishmentID];

  cy.task('dbQuery', { queryString, parameters });
});

Cypress.Commands.add('insertTrainingCourse', (args) => {
  const { establishmentID, categoryId = 1, name = 'Test training course' } = args;

  const queryString = `INSERT INTO cqc."TrainingCourse"
  ("EstablishmentFK", "CategoryFK", "Name")
  VALUES ($1, $2, $3) RETURNING "ID";`;

  const parameters = [establishmentID, categoryId, name];

  return cy.task('dbQuery', { queryString, parameters });
});

Cypress.Commands.add('getTrainingCourseId', (establishmentID, trainingCourseName) => {
  const queryString = `SELECT "ID" FROM cqc."TrainingCourse"
  WHERE "EstablishmentFK" = $1
  AND "Name" = $2`;

  const parameters = [establishmentID, trainingCourseName];

  cy.task('dbQuery', { queryString, parameters }).then((result) => {
    cy.wrap(result.rows[0]?.ID).as('trainingCourseId');
  });
});

Cypress.Commands.add('unlinkAllWorkerTrainingFromCourse', () => {
  const queryString = `UPDATE cqc."WorkerTraining"
    SET "TrainingCourseFK" = null
    WHERE "TrainingCourseFK" is not null;`;

  cy.task('dbQuery', { queryString });
});
