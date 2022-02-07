const moment = require('moment');

const config = require('../../../config/config');

const lastMonth = moment().subtract(1, 'months');

const templates = {
  sixMonths: {
    lastLogin: lastMonth.clone().subtract(6, 'months'),
    template: config.get('sendInBlue.templates.sixMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastLogin, 'month');
    },
  },
  twelveMonths: {
    lastLogin: lastMonth.clone().subtract(12, 'months'),
    template: config.get('sendInBlue.templates.twelveMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastLogin, 'month');
    },
  },
  eighteenMonths: {
    lastLogin: lastMonth.clone().subtract(18, 'months'),
    template: config.get('sendInBlue.templates.eighteenMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastLogin, 'month');
    },
  },
  twentyFourMonths: {
    lastLogin: lastMonth.clone().subtract(24, 'months'),
    template: config.get('sendInBlue.templates.twentyFourMonthsInactive'),
    matches: function (lastLogin) {
      return lastLogin.isSame(this.lastLogin, 'month');
    },
  },
};

const getTemplate = (inactiveWorkplace) => {
  const lastUpdated = moment(inactiveWorkplace.LastLogin);

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
