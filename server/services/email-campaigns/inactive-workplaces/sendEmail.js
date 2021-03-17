const moment = require('moment');

const config = require('../../../config/config');
const sendInBlueEmail = require('../../../utils/email/sendInBlueEmail');

const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');

const getParams = (workplace) => {
  const params = {
    WORKPLACE_ID: workplace.nmdsId,
    FULL_NAME: workplace.user.name,
  };

  switch (workplace.emailTemplate.id) {
    case config.get('sendInBlue.templates.parent').id:
      params.WORKPLACES = workplace.subsidiaries;

      if (moment(workplace.lastUpdated) <= endOfLastMonth.clone().subtract(6, 'months')) {
        const { id, name, nmdsId, lastUpdated, dataOwner } = workplace;

        params.WORKPLACES.unshift({ id, name, nmdsId, lastUpdated, dataOwner });
      }
      break;
  }

  return params;
};

const sendEmail = async (workplace) => {
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
