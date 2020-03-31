exports.wdfEligibilityDate = () => {
  // calculate the effective from date
  const today = new Date();
  const yearStartMonth = 2;           // April (months start at 0)
  if (today.getMonth() < yearStartMonth) {
      return new Date(Date.UTC(today.getFullYear()-1, yearStartMonth, 31));
  } else {
      return new Date(Date.UTC(today.getFullYear(), yearStartMonth, 31));
  }
};
