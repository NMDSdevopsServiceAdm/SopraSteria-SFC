const ownership = require('../../data/ownership');
const { Establishment } = require('../../models/classes/establishment');

async function update(request, ownershipChangeRequest) {
  let workplaceEstablishmentId = request.establishment.id;

  const currentDataOwnerDetails = await ownership.getownershipRequesterId(workplaceEstablishmentId);

  let updateDetails = {
    dataPermissions: ownershipChangeRequest[0].permissionRequest,
  };

  if (currentDataOwnerDetails[0].IsParent === false && currentDataOwnerDetails[0].ParentID) {
    updateDetails.dataOwner = 'Parent';
    workplaceEstablishmentId = request.establishment.id;
  } else {
    updateDetails.dataOwner = 'Workplace';
    workplaceEstablishmentId = ownershipChangeRequest[0].subEstablishmentID;
  }

  const result = await Establishment.fetchAndUpdateEstablishmentDetails(workplaceEstablishmentId, updateDetails);

  return result;
}

module.exports = {
  update,
};
