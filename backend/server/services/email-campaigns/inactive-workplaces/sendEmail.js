const moment = require('moment');

const config = require('../../../config/config');
const sendToSQSQueue = require('../../../utils/email/sendToSQSQueue');
const isWhitelisted = require('../isWhitelisted');

const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');

const getParams = (workplace) => {
  const params = {
    WORKPLACE_ID: workplace.nmdsId,
    FULL_NAME: workplace.user.name,
  };

  switch (workplace.emailTemplate.id) {
    case config.get('sendInBlue.templates.parent').id:
      params.WORKPLACES = workplace.subsidiaries.map((subsidiary) => {
        const { id, name, nmdsId, lastLogin, lastUpdated, dataOwner } = subsidiary;
        const lastLoginFormatted = moment(lastLogin).format('Mo MMMM YYYY');
        const lastUpdatedFormatted = moment(lastUpdated).format('Mo MMMM YYYY');

        return {
          id,
          name,
          nmdsId,
          lastLogin: lastLoginFormatted,
          lastUpdated: lastUpdatedFormatted,
          dataOwner,
        };
      });

      if (
        moment(workplace.lastLogin) <= endOfLastMonth.clone().subtract(6, 'months') &&
        moment(workplace.lastUpdated) <= endOfLastMonth.clone().subtract(6, 'months')
      ) {
        const { id, name, nmdsId, lastLogin, lastUpdated, dataOwner } = workplace;
        const lastLoginFormatted = moment(lastLogin).format('Mo MMMM YYYY');
        const lastUpdatedFormatted = moment(lastUpdated).format('Mo MMMM YYYY');

        params.WORKPLACES.unshift({
          id,
          name,
          nmdsId,
          lastLogin: lastLoginFormatted,
          lastUpdated: lastUpdatedFormatted,
          dataOwner,
        });
      }
      break;
  }

  return params;
};

const sendEmail = async (workplace, index) => {
  if (!isWhitelisted.isWhitelisted(workplace.user.email)) {
    return;
  }

  const params = getParams(workplace);

  sendToSQSQueue.sendToSQSQueue(
    {
      email: workplace.user.email,
      name: workplace.user.name,
    },
    workplace.emailTemplate.id,
    params,
    index,
  );
};

module.exports = {
  sendEmail,
  getParams,
};
