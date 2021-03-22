const ownership = require('../../data/ownership');
const { Establishment } = require('../../models/classes/establishment');

async function update(request, ownershipChangeRequest) {
  const currentDataOwnerDetails = await ownership.getownershipRequesterId(request.establishment.id);

  const isSubsidiary = currentDataOwnerDetails[0].IsParent === false && currentDataOwnerDetails[0].ParentID;

  const workplaceEstablishmentId = isSubsidiary
    ? request.establishment.id
    : ownershipChangeRequest[0].subEstablishmentID;

  const updateDetails = {
    dataPermissions: ownershipChangeRequest[0].permissionRequest,
    dataOwner: isSubsidiary ? 'Parent' : 'Workplace',
  };

  return await Establishment.fetchAndUpdateEstablishmentDetails(workplaceEstablishmentId, updateDetails);
}

module.exports = {
  update,
};
