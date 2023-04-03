// default route for accepting/rejecting change ownership request
const express = require('express');
const router = express.Router();
const Authorization = require('../../utils/security/isAuthenticated');
const { hasPermission } = require('../../utils/security/hasPermission');
const OwnershipChange = require('../ownershipRequest/ownershipChange');

// PUT request for ownership change request approve/reject
const ownershipRequest = async (req, res) => {
  try {
    const resp = await OwnershipChange.ActionRequest(req);
    console.log(resp);
    return res.status(resp.statusCode).send(resp.response);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).send({ message: e.message });
    }
    console.error('/ownershipRequest/:id: ERR: ', e.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

router.route('/:id').put(Authorization.isAuthorised, hasPermission('canEditEstablishment'), ownershipRequest);

module.exports = router;
