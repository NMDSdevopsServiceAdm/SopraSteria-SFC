'use strict';

const db = rfr('server/utils/datastore');

const getTrainingDataQuery =
`
SELECT
  a."NameOrIdValue", a."ID",  c."Category", b."Title", to_char(b."Completed", :timeFormat) as "Completed", e."JobName",
  to_char(b."Expires", :timeFormat) as "ExpiredOn", b."Accredited", b."Expires"
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

exports.getTrainingData = async establishmentId =>
  db.query(getTrainingDataQuery, {
    replacements: {
      establishmentId,
      falseValue: false,
      timeFormat: 'DD/MM/YYYY'
    },
    type: db.QueryTypes.SELECT
  });
