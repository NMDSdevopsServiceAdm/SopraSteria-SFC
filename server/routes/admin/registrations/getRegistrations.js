
// Get registrations that are pending and in progress

// Get registrations that are rejected

// require - { WorkplaceName, Postcode, parentID, Received, Status, WorkplaceUID }

const router = require('express').Router();
const models = require('../../../models');

const getParentEstablishmentId = async (parentId) => {
  const parentEstablishmentData = await models.establishment.getNmdsIdUsingEstablishmentId(parentId);

  return parentEstablishmentData.get('NmdsID');
};

const getRegistrations = async (req, res) => {
  try {
    const establishmentRegistrations = await models.establishment.getEstablishmentRegistrationsByStatus('PENDING');

    const formattedEstablishments = establishmentRegistrations.map(async (registration) => {
      const parentId = registration.get('ParentID');

      return {
        created: registration.created,
        name: registration.NameValue,
        postcode: registration.get('PostCode'),
        status: registration.get('Status'),
        workplaceUid: registration.get('EstablishmentUID'),
        parentUid: registration.get('parentUID'),
        parentId: parentId,
        parentEstablishmentId: parentId ? await getParentEstablishmentId(parentId) : null,
      };
    });

    const allRegistrations = await Promise.all(formattedEstablishments);

    res.status(200).send(allRegistrations);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
}



router.route('/').get(getRegistrations);

module.exports = router;
module.exports.getRegistrations = getRegistrations;
