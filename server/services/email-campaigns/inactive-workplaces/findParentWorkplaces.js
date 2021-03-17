const moment = require('moment');
const config = require('../../../config/config');
const { getParentWorkplaces } = require('../../../models/email-campaigns/inactive-workplaces/getParentWorkplaces');

const lastMonth = moment().subtract(1, 'months');

const transformSubsidiaryWorkplace = (subsidiary) => {
  return {
    id: subsidiary.EstablishmentID,
    name: subsidiary.NameValue,
    nmdsId: subsidiary.NmdsID,
    lastUpdated: subsidiary.LastUpdated,
    dataOwner: subsidiary.DataOwner,
  };
};

const transformParentWorkplaces = (workplaces, parentWorkplace) => {
  const subsidiaries = workplaces
    .filter((subsidiary) => {
      return (
        subsidiary.ParentID === parentWorkplace.EstablishmentID &&
        moment(subsidiary.LastUpdated) <= lastMonth.clone().subtract(6, 'months')
      );
    })
    .map(transformSubsidiaryWorkplace);

  return {
    id: parentWorkplace.EstablishmentID,
    name: parentWorkplace.NameValue,
    nmdsId: parentWorkplace.NmdsID,
    lastUpdated: parentWorkplace.LastUpdated,
    emailTemplate: config.get('sendInBlue.templates.parent'),
    dataOwner: parentWorkplace.DataOwner,
    user: {
      name: parentWorkplace.PrimaryUserName,
      email: parentWorkplace.PrimaryUserEmail,
    },
    subsidiaries: subsidiaries,
  };
};

const isParent = (workplace) => {
  return workplace.IsParent;
}

const parentOrSubsInactive = (parent) => {
  return parent.subsidiaries.length || moment(parent.lastUpdated) <= lastMonth.clone().subtract(6, 'months');
}

const findParentWorkplaces = async () => {
  const workplaces = await getParentWorkplaces();

  return workplaces
    .filter(isParent)
    .map((parentWorkplace) => {
      return transformParentWorkplaces(workplaces, parentWorkplace);
    })
    .filter(parentOrSubsInactive);
};

module.exports = {
  findParentWorkplaces,
};
