exports.combineAllJobsJSON = (establishment) => {
  return {
    jobs: {
      Vacancies: establishment.Vacancies,
      Starters: establishment.Starters,
      Leavers: establishment.Leavers,
      TotalVacencies: establishment.TotalVacencies,
      TotalStarters: establishment.TotalStarters,
      TotalLeavers: establishment.TotalLeavers,
    },
  };
};
