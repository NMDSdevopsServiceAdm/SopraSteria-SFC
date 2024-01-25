const router = require('express').Router({ mergerParams: true });
const models = require('../../models');

const establishmentExistsCheck = async (req, res) => {
  const { locationID } = req.params;

  try {
    const result = await models.establishment.findByLocationID(locationID);

    res.status(200).json({ exists: result.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'There was a problem checking if the establishment already exists in the service',
    });
  }
};

router.route('/:locationID').get(establishmentExistsCheck);

module.exports = router;
module.exports.establishmentExistsCheck = establishmentExistsCheck;
