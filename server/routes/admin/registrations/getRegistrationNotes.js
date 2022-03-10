const router = require('express').Router();
const models = require('../../../models');

const getRegistrationNotes = async (req, res) => {
  try {
    const { establishmentUid } = req.params;
    const establishment = await models.establishment.findByUid(establishmentUid, true);

    if (!establishment) {
      return res.status(400).json({
        message: 'Establishment could not be found',
      });
    }

    const establishmentId = establishment.id;

    const notes = await models.notes.getNotesByEstablishmentId(establishmentId);

    res.status(200).send(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'There was an error retrieving notes for this registration',
    });
  }
};

router.route('/:establishmentUid').get(getRegistrationNotes);

module.exports = router;
module.exports.getRegistrationNotes = getRegistrationNotes;
