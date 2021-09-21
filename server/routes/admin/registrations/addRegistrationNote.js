const router = require('express').Router();
const models = require('../../../models');

const addRegistrationNote = async (req, res) => {
  const { note, establishmentId } = req.body;

  try {
    const user = await models.user.findByUUID(req.userUid);
    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    const establishment = await models.establishment.findByPk(establishmentId);
    if (!establishment) {
      return res.status(400).json({
        message: 'Establishment not found',
      });
    }


    await models.registrationNotes.createNote(user.id, establishmentId, note);

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'There was a problem adding the note',
    });
  }
}


router.route('/').post(addRegistrationNote);

module.exports = router;
module.exports.addRegistrationNote = addRegistrationNote;
