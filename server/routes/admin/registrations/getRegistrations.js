const router = require('express').Router();
const models = require('../../../models');
const { convertBasicRegistrationResponse } = require('../../../utils/registrationsUtils');

const getRegistrations = async (req, res) => {
  try {
    const registrations = await models.establishment.getEstablishmentRegistrationsByStatus('PENDING');

    const convertedRegistrations = registrations.map(async (registration) => {
      const parentId = registration.get('ParentID');
      registration.parentEstablishmentId = parentId
        ? await getParentEstablishmentId(registration.get('ParentID'))
        : null;
      return convertBasicRegistrationResponse(registration);
    });

    const allRegistrations = await Promise.all(convertedRegistrations);

    res.status(200).send(allRegistrations);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};

const getParentEstablishmentId = async (parentId) => {
  const parentEstablishmentData = await models.establishment.getNmdsIdUsingEstablishmentId(parentId);

  return parentEstablishmentData.get('NmdsID');
};

router.route('/').get(getRegistrations);

module.exports = router;
module.exports.getRegistrations = getRegistrations;
