const moment = require('moment');

const config = require('../../../config/config');

const lastMonth = moment().subtract(1, 'months');

const templates = {
  sixMonths: {
    lastUpdated: lastMonth.clone().subtract(6, 'months'),
    template: config.get('sendInBlue.templates.sixMonthsInactive'),
    matches: function (lastUpdated) {
      return lastUpdated.isSame(this.lastUpdated, 'month');
    },
  },
  twelveMonths: {
    lastUpdated: lastMonth.clone().subtract(12, 'months'),
    template: config.get('sendInBlue.templates.twelveMonthsInactive'),
    matches: function (lastUpdated) {
      return lastUpdated.isSame(this.lastUpdated, 'month');
    },
  },
  eighteenMonths: {
    lastUpdated: lastMonth.clone().subtract(18, 'months'),
    template: config.get('sendInBlue.templates.eighteenMonthsInactive'),
    matches: function (lastUpdated) {
      return lastUpdated.isSame(this.lastUpdated, 'month');
    },
  },
  twentyFourMonths: {
    lastUpdated: lastMonth.clone().subtract(24, 'months'),
    template: config.get('sendInBlue.templates.twentyFourMonthsInactive'),
    matches: function (lastUpdated) {
      return lastUpdated.isSame(this.lastUpdated, 'month');
    },
  },
};

const getTemplate = (inactiveWorkplace) => {
  const lastUpdated = moment(inactiveWorkplace.LastUpdated);

  for (const [, month] of Object.entries(templates)) {
    const nextTemplate = month.template;
    const lastTemplate = inactiveWorkplace.LastTemplate ? parseInt(inactiveWorkplace.LastTemplate) : null;
    const notReceivedTemplate = lastTemplate !== nextTemplate.id;

    if (month.matches(lastUpdated) && notReceivedTemplate) {
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
