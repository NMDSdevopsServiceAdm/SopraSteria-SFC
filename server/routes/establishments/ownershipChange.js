const express = require('express');
const router = express.Router();
const OwnershipChange = require('../ownershipRequest/ownershipChange');

// POST request for ownership change request
const ownershipChangeRequest = async (req, res) => {
  try {
    const resp = await OwnershipChange.CreateRequest(req);
    return res.status(resp.status).send(resp.response);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).send({ message: e.message });
    }
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

// POST request for cancel already requested ownership
const cancelOwnershipChangeRequest = async (req, res) => {
  try {
    const resp = await OwnershipChange.CancelRequest(req);
    return res.status(resp.statusCode).send(resp.response);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).send({ message: e.message });
    }
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

// GET request to fetch changeownership request Id
const getOwnershipChangeRequest = async (req, res) => {
  try {
    const resp = await OwnershipChange.GetRequest(req);
    return res.status(resp.statusCode).send(resp.response);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).send({ message: e.message });
    }
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

router.route('/').post(ownershipChangeRequest);
router.route('/details').get(getOwnershipChangeRequest);
router.route('/:id').post(cancelOwnershipChangeRequest);

module.exports = router;
