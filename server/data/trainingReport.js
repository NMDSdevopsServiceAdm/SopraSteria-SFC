'use strict';

const db = rfr('server/utils/datastore');

const getTrainingDataQuery =
`
SELECT
  a."NameOrIdValue", a."ID",  c."Category", b."Title", to_char(b."Completed", :timeFormat) as "Completed",
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
LEFT JOIN
  cqc."WorkerJobs" d
ON
  a."ID" = d."WorkerFK"
LEFT JOIN
  cqc."Job" e
ON d."JobFK" = e."JobID"
WHERE
  a."EstablishmentFK" = :establishmentId AND
  a."Archived" = :falseValue;
`;

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

exports.getJobName = async jobId =>
  db.query(getJobNameQuery, {
    replacements: {
      jobId,
    },
    type: db.QueryTypes.SELECT
  });
