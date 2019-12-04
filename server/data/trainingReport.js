'use strict';

const db = rfr('server/utils/datastore');

const getTrainingDataQuery =
`
SELECT
  a."NameOrIdValue", c."Category", b."Title", b."Completed", e."JobName",
  b."Expires", b."Accredited"
FROM
  cqc."Worker" a
JOIN
  cqc."WorkerTraining" b
ON
  a."ID" = b."WorkerFK"
JOIN
  cqc."TrainingCategories" c
ON
  b."CategoryFK" = c."ID"
JOIN
  cqc."WorkerJobs" d
ON
  a."ID" = d."WorkerFK"
JOIN
  cqc."Job" e
ON d."JobFK" = e."JobID"
WHERE
  a."EstablishmentFK" = :establishmentId AND
  a."Archived" = :falseValue;
`;

exports.getTrainingData = async establishmentId =>
  db.query(getTrainingDataQuery, {
    replacements: {
      establishmentId,
      falseValue: false
    },
    type: db.QueryTypes.SELECT
  });
