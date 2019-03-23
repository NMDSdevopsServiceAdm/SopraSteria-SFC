exports.combineAllJobsJSON = (vacancies, starters, leavers) => {
  return {
    jobs: {
      Vacancies: vacancies,
      Starters: starters,
      Leavers: leavers,
    }
  }
};
