const moment = require('moment');

const config = require('../../../config/config');
const { getParentWorkplaces } = require('../../../models/email-campaigns/inactive-workplaces/getParentWorkplaces');

const lastMonth = moment().subtract(1, 'months');

const buildWorkplaces = (workplaces) => {
  return workplaces.reduce((acc, workplace) => {
    if (workplace.IsParent) {
      acc[workplace.EstablishmentID] = {
        subsidiaries: [],
        ...workplace,
        ...acc[workplace.EstablishmentID],
      };

      return acc;
    }

    const parent = acc[workplace.ParentID] || (acc[workplace.ParentID] = {});
    const subsidiaries = parent.subsidiaries || (parent.subsidiaries = []);

    if (moment(workplace.LastLogin) <= lastMonth.clone().subtract(6, 'months').endOf('month').endOf('day')) {
      subsidiaries.push(workplace);
    }

    return acc;
  }, {});
};

const transformWorkplaces = ([, workplace]) => {
  return {
    id: workplace.EstablishmentID,
    name: workplace.NameValue,
    nmdsId: workplace.NmdsID,
    lastLogin: workplace.LastLogin,
    emailTemplate: config.get('sendInBlue.templates.parent'),
    dataOwner: workplace.DataOwner,
    user: {
      name: workplace.PrimaryUserName,
      email: workplace.PrimaryUserEmail,
    },
    subsidiaries: workplace.subsidiaries.map(transformSubsidiaryWorkplace),
  };
};

const transformSubsidiaryWorkplace = (subsidiary) => {
  return {
    id: subsidiary.EstablishmentID,
    name: subsidiary.NameValue,
    nmdsId: subsidiary.NmdsID,
    lastLogin: subsidiary.LastLogin,
    dataOwner: subsidiary.DataOwner,
  };
};

const parentOrSubsInactive = (parent) => {
  return (
    parent.subsidiaries.length ||
    moment(parent.lastLogin) <= lastMonth.clone().subtract(6, 'months').endOf('month').endOf('day')
  );
};

const findParentWorkplaces = async () => {
  const workplaces = await getParentWorkplaces();

  return Object.entries(buildWorkplaces(workplaces)).map(transformWorkplaces).filter(parentOrSubsInactive);
};

module.exports = {
  findParentWorkplaces,
};
