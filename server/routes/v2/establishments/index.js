const express = require('express');
const router = express.Router();
const {
  getEstablishment,
  addEstablishment,
  updateEstablishment,
  deleteEstablishment,
} = require('../../../services/establishment/establishment');
const Authorization = require('../../../utils/security/isAuthenticated');
const { hasPermission } = require('../../../utils/security/hasPermission');

const Benchmarks = require('./benchmarks');

router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.use('/:id/benchmarks', Benchmarks);

router.route('/:id').get(getEstablishment);
router.route('/:id').post(hasPermission('canAddEstablishment'), addEstablishment);
router.route('/:id').put(hasPermission('canEditEstablishment'), updateEstablishment);
router.route('/:id').delete(hasPermission('canDeleteEstablishment'), deleteEstablishment);

module.exports = router;
