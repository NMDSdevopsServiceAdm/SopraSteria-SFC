const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const config = require('../config/config');

dayjs.extend(timezone);

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

const formatDateTime = (date, formatString) => {
  const timezone = config.get('timezone');
  return dayjs(date).tz(timezone).format(formatString);
};

const getToday = (format = 'YYYY-MM-DD') => {
  const now = dayjs();
  return now.format(format);
};

module.exports = { calculateTrainingExpiryDate, getToday, formatDateTime };
