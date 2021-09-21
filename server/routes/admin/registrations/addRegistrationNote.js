const router = require('express').Router();
const models = require('../../../models');

const addRegistrationNote = async (req, res) => {
  console.log(req.userId);
  console.log(req.establishment.id);
  console.log(req.body);
  try {
    console.log("******* Success ********");
    // const { note } = req.body;
    // const result = await models.registrationNotes.createNote(req.userId, req.establishment.id, note);
    // console.log("******** Result *******");
    // console.log(result)
    res.status(200).send();
  } catch (error) {
    console.log("******* Error *********");
    console.log(error);
    res.status(400).send();
  }
}


router.route('/').post(addRegistrationNote);

module.exports = router;
module.exports.addRegistrationNote = addRegistrationNote;
