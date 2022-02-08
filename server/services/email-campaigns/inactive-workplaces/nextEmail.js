const moment = require('moment');

const config = require('../../../config/config');

const lastMonth = moment().subtract(1, 'months');

const templates = {
  sixMonths: {
    lastActivity: lastMonth.clone().subtract(6, 'months'),
    template: config.get('sendInBlue.templates.sixMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastActivity, 'month');
    },
  },
  twelveMonths: {
    lastActivity: lastMonth.clone().subtract(12, 'months'),
    template: config.get('sendInBlue.templates.twelveMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastActivity, 'month');
    },
  },
  eighteenMonths: {
    lastActivity: lastMonth.clone().subtract(18, 'months'),
    template: config.get('sendInBlue.templates.eighteenMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastActivity, 'month');
    },
  },
  twentyFourMonths: {
    lastActivity: lastMonth.clone().subtract(24, 'months'),
    template: config.get('sendInBlue.templates.twentyFourMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastActivity, 'month');
    },
  },
};

const getTemplate = (inactiveWorkplace) => {
  const lastLogin = moment(inactiveWorkplace.LastLogin);
  const lastUpdated = moment(inactiveWorkplace.LastUpdated);

  for (const [, month] of Object.entries(templates)) {
    const nextTemplate = month.template;
    const lastTemplate = inactiveWorkplace.LastTemplate ? parseInt(inactiveWorkplace.LastTemplate) : null;
    const notReceivedTemplate = lastTemplate !== nextTemplate.id;

    if ((month.matches(lastUpdated) || month.matches(lastLogin)) && notReceivedTemplate) {
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
