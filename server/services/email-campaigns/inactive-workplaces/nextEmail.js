const moment = require('moment');
const config = require('../../../config/config');

const lastMonth = moment().subtract(1, 'months');

const templates = {
  sixMonths: {
    lastUpdated: lastMonth.clone().subtract(6, 'months'),
    template: 'sendInBlue.templates.sixMonthsInactive',
  },
  twelveMonths: {
    lastUpdated: lastMonth.clone().subtract(12, 'months'),
    template: 'sendInBlue.templates.twelveMonthsInactive',
  },
  eighteenMonths: {
    lastUpdated: lastMonth.clone().subtract(18, 'months'),
    template: 'sendInBlue.templates.eighteenMonthsInactive',
  },
  twentyFourMonths: {
    lastUpdated: lastMonth.clone().subtract(24, 'months'),
    template: 'sendInBlue.templates.twentyFourMonthsInactive'
  }
};

const getTemplate = (inactiveWorkplace) => {
  const lastUpdated = moment(inactiveWorkplace.LastUpdated);

  for (const [key, month] of Object.entries(templates)) {
    const nextTemplate = config.get(month.template);
    const notReceivedTemplate = inactiveWorkplace.LastTemplate !== nextTemplate.id;

    if (lastUpdated.isSame(month.lastUpdated, 'month') && notReceivedTemplate) {
      return nextTemplate;
    }
  }

  return null;
};

const shouldReceive = (inactiveWorkplace) => {
  return getTemplate(inactiveWorkplace) !== null;
};

module.exports = {
  getTemplate,
  shouldReceive,
};
