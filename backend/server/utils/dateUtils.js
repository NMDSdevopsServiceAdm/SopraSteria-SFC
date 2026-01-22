const dayjs = require('dayjs');

const calculateTrainingExpiryDate = (completionDate, validityPeriodInMonth) => {
  const parsedCompletionDate = dayjs(completionDate);
  const parsedValidityPeriodInMonth = Number(validityPeriodInMonth);
  const inputsAreValid = parsedCompletionDate.isValid() && parsedValidityPeriodInMonth > 0;

  if (!inputsAreValid) {
    return null;
  }

  if (parsedCompletionDate.date() === 1) {
    return parsedCompletionDate
      .add(validityPeriodInMonth - 1, 'month')
      .endOf('month')
      .format('YYYY-MM-DD');
  }

  return parsedCompletionDate.subtract(1, 'day').add(validityPeriodInMonth, 'month').format('YYYY-MM-DD');
};

module.exports = { calculateTrainingExpiryDate };
