const moment = require('moment');
const config = require('../../../config/config');

const lastMonth = moment().subtract(1, 'months');

const templates = {
  sixMonths: {
    lastUpdated: lastMonth.clone().subtract(6, 'months'),
    template: config.get('sendInBlue.templates.sixMonthsInactive'),
  },
  twelveMonths: {
    lastUpdated: lastMonth.clone().subtract(12, 'months'),
    template: config.get('sendInBlue.templates.twelveMonthsInactive'),
  },
  eighteenMonths: {
    lastUpdated: lastMonth.clone().subtract(18, 'months'),
    template: config.get('sendInBlue.templates.eighteenMonthsInactive'),
  },
  twentyFourMonths: {
    lastUpdated: lastMonth.clone().subtract(24, 'months'),
    template: config.get('sendInBlue.templates.twentyFourMonthsInactive'),
  },
};

const getTemplate = (inactiveWorkplace) => {
  const lastUpdated = moment(inactiveWorkplace.LastUpdated);

  for (const [_key, month] of Object.entries(templates)) {
    const nextTemplate = month.template;
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
