'use strict';

const db = rfr('server/utils/datastore');

const getTrainingDataQuery =
`
SELECT
  a."NameOrIdValue", a."ID",  c."Category", c."ID", b."Title", to_char(b."Completed", :timeFormat) as "Completed",
  to_char(b."Expires", :timeFormat) as "ExpiredOn", b."Accredited", b."Expires", a."MainJobFKValue"
FROM
  cqc."Worker" a
JOIN
  cqc."WorkerTraining" b
ON
  a."ID" = b."WorkerFK"
LEFT JOIN
  cqc."TrainingCategories" c
ON
  b."CategoryFK" = c."ID"
WHERE
  a."EstablishmentFK" = :establishmentId AND
  a."Archived" = :falseValue;
`;

const getMndatoryTrainingDetailsQuery =
`SELECT count(:zero)
FROM cqc."MandatoryTraining"
WHERE "EstablishmentFK" = :establishmentId
AND "TrainingCategoryFK" = :categoryId
AND "JobFK" = :jobId`

const getJobNameQuery =
`
select "JobName" from cqc."Job" where "JobID" = :jobId
`;

exports.getTrainingData = async establishmentId =>
  db.query(getTrainingDataQuery, {
    replacements: {
      establishmentId,
      falseValue: false,
      timeFormat: 'DD/MM/YYYY'
    },
    type: db.QueryTypes.SELECT
  });

exports.getMndatoryTrainingDetails = async (trainingData, establishmentId) =>
  db.query(getMndatoryTrainingDetailsQuery, {
    replacements: {
      establishmentId,
      jobId: trainingData.MainJobFKValue,
      categoryId: trainingData.ID,
      zero: 0
    },
    type: db.QueryTypes.SELECT
  });

exports.getJobName = async jobId =>
  db.query(getJobNameQuery, {
    replacements: {
      jobId,
    },
    type: db.QueryTypes.SELECT
  });
