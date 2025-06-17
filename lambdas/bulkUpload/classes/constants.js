const SALARY_INT_STRINGS = {
  Annually: 'Annually',
  Hourly: 'Hourly',
  DontKnow: "Don't know",
};

const SALARY_INT_OPTIONS = [
  { bulkUploadValue: 1, databaseValue: SALARY_INT_STRINGS.Annually },
  { bulkUploadValue: 3, databaseValue: SALARY_INT_STRINGS.Hourly },
  { bulkUploadValue: 999, databaseValue: SALARY_INT_STRINGS.DontKnow },
];

module.exports = { SALARY_INT_STRINGS, SALARY_INT_OPTIONS };
