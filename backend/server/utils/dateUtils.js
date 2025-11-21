const dayjs = require('dayjs');

const calculateTrainingExpiryDate = (completionDate, validityPeriodInMonth) => {
  const parsedCompletionDate = dayjs(completionDate, 'YYYY-MM-DD');
  const parsedValidityPeriodInMonth = Number(validityPeriodInMonth);
  const inputsAreValid = parsedCompletionDate.isValid() && parsedValidityPeriodInMonth > 0;

  if (!inputsAreValid) {
    return null;
  }

  return parsedCompletionDate.subtract(1, 'day').add(validityPeriodInMonth, 'month').format('YYYY-MM-DD');
};

module.exports = { calculateTrainingExpiryDate };
