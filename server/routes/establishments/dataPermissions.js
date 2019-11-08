const express = require('express');
const router = express.Router();
const Establishment = require('../../models/classes/establishment');

// POST request for change data permissions
router.route('/').post(async (req, res) => {
  try {
    const permissionRequestArr = ['Workplace', 'Workplace and Staff', 'None'];
    if (permissionRequestArr.indexOf(req.body.permissionToSet) === -1) {
      console.error('Invalid data permission value');
      return res.status(400).send();
    }

    const params = {
      dataPermissions: req.body.permissionToSet,
    };

    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      let establishmentResponse = await Establishment.Establishment.fetchAndUpdateEstablishmentDetails(thisEstablishment.id, params);
      if(establishmentResponse){
        return res.status(201).send(establishmentResponse);
      }
    } else {
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }
  } catch (e) {
    console.error('/establishment/:id/dataPermissions: ERR: ', e.message);
    return res.status(503).send({}); // intentionally an empty JSON response
  }
});

module.exports = router;
