const { getParentWorkplaces } = require('../../../models/email-campaigns/inactive-workplaces/getParentWorkplaces');

const findParentWorkplaces = async () => {
  const workplaces = await getParentWorkplaces();

  return workplaces
    .filter((workplace) => workplace.IsParent)
    .map((parentWorkplace) => {
      const subsidiaries = workplaces
        .filter((subsidiary) => {
          return subsidiary.ParentID === parentWorkplace.EstablishmentID;
        })
        .map((subsidiary) => {
          return {
            id: subsidiary.EstablishmentID,
            name: subsidiary.NameValue,
            nmdsId: subsidiary.NmdsID,
            lastUpdated: subsidiary.LastUpdated,
            dataOwner: subsidiary.DataOwner,
          };
        });

      const id = parentWorkplace.EstablishmentID;
      const name = parentWorkplace.NameValue;
      const nmdsId = parentWorkplace.NmdsID;
      const lastUpdated = parentWorkplace.LastUpdated;
      const emailTemplate = {
        id: 15,
        name: 'Parent',
      };
      const dataOwner = parentWorkplace.DataOwner;
      const user = {
        name: parentWorkplace.PrimaryUserName,
        email: parentWorkplace.PrimaryUserEmail,
      };

      return {
        id,
        name,
        nmdsId,
        lastUpdated,
        emailTemplate,
        dataOwner,
        user,
        subsidiaries,
      };
    });
};

module.exports = {
  findParentWorkplaces,
};
