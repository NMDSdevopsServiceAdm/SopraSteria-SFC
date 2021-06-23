const moment = require('moment');

const config = require('../../../config/config');
const sendInBlueEmail = require('../../../utils/email/sendInBlueEmail');
const isWhitelisted = require('../isWhitelisted');

const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');

const getParams = (workplace) => {
  const params = {
    WORKPLACE_ID: workplace.nmdsId,
    FULL_NAME: workplace.user.name,
  };

  switch (workplace.emailTemplate.id) {
    case config.get('sendInBlue.templates.parent').id:
      params.WORKPLACES = workplace.subsidiaries.map(subsidiary => {
        const { id, name, nmdsId, lastUpdated, dataOwner } = subsidiary;
        const lastUpdatedFormatted = moment(lastUpdated).format('Mo MMMM YYYY');

        return {
          id,
          name,
          nmdsId,
          lastUpdated: lastUpdatedFormatted,
          dataOwner
        }
      });

      if (moment(workplace.lastUpdated) <= endOfLastMonth.clone().subtract(6, 'months')) {
        const { id, name, nmdsId, lastUpdated, dataOwner } = workplace;
        const lastUpdatedFormatted = moment(lastUpdated).format('Mo MMMM YYYY');

        params.WORKPLACES.unshift({
          id,
          name,
          nmdsId,
          lastUpdated: lastUpdatedFormatted,
          dataOwner
        });
      }
      break;
  }

  return params;
};

const sendEmail = async (workplace) => {
  if (!isWhitelisted.isWhitelisted(workplace.user.email)) {
    return;
  }

  const params = getParams(workplace);

  sendInBlueEmail.sendEmail(
    {
      email: workplace.user.email,
      name: workplace.user.name,
    },
    workplace.emailTemplate.id,
    params,
  );
};

module.exports = {
  sendEmail,
  getParams,
};
