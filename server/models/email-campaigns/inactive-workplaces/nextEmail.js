const moment = require('moment');
const config = require('../../../config/config');

const getTemplate = (inactiveWorkplace) => {
  const lastMonth = moment().subtract(1, 'months');
  const lastUpdated = moment(inactiveWorkplace.LastUpdated);

  const sixMonths = lastMonth.clone().subtract(6, 'months');
  const twelveMonths = lastMonth.clone().subtract(12, 'months');
  const eighteenMonths = lastMonth.clone().subtract(18, 'months');
  const twentyFourMonths = lastMonth.clone().subtract(24, 'months');

  if (lastUpdated.isSame(sixMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.sixMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  if (lastUpdated.isSame(twelveMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.twelveMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  if (lastUpdated.isSame(eighteenMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.eighteenMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  if (lastUpdated.isSame(twentyFourMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.twentyFourMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  return null;
};

const shouldReceive = (inactiveWorkplace) => {
  return getTemplate(inactiveWorkplace) !== null;
}

module.exports = {
  getTemplate,
  shouldReceive,
}
