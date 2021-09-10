const { convertWorkplaceAndUserDetails } = require('../../../utils/registrationsUtils');
const models = require('../../../models');

const getSingleRegistration = async (req, res) => {
  try {
    const workplaceAndUser = await models.establishment.getEstablishmentWithPrimaryUser(req.params.establishmentUid);

    const workplaceAndUserDetails = convertWorkplaceAndUserDetails(workplaceAndUser);

    if (workplaceAndUserDetails.establishment.parentId) {
      workplaceAndUserDetails.establishment.parentEstablishmentId = await getParentEstablishmentId(
        workplaceAndUserDetails.establishment.parentId,
      );
    }

    res.status(200).send(workplaceAndUserDetails);
  } catch (err) {
    console.error(err);
    res.status(503);
  }
};

const getParentEstablishmentId = async (parentId) => {
  const parentEstablishmentData = await models.establishment.findOne({
    where: {
      id: parentId,
    },
    attributes: ['NmdsID'],
  });

  return parentEstablishmentData.get('NmdsID');
};

const router = require('express').Router();

router.route('/:establishmentUid').get(getSingleRegistration);

module.exports = router;
module.exports.getSingleRegistration = getSingleRegistration;
