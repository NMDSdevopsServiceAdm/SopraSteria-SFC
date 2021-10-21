const router = require('express').Router();
const models = require('../../../models');
const { convertBasicRegistrationResponse } = require('../../../utils/registrationsUtils');

const getRegistrations = async (req, res) => {
  const isRejection = req.params.status === 'pending' ? false : true;

  try {
    const registrations = await models.establishment.getEstablishmentRegistrationsByStatus(isRejection);

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

router.route('/:status').get(getRegistrations);

module.exports = router;
module.exports.getRegistrations = getRegistrations;
