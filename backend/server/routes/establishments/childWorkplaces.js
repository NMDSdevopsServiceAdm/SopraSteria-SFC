const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');

const getChildWorkplaces = async (req, res) => {
  try {
    const { itemsPerPage, pageIndex, searchTerm, getPendingWorkplaces } = req.query;

    const childWorkplaces = await models.establishment.getChildWorkplaces(
      req.params.id,
      itemsPerPage ? +itemsPerPage : undefined,
      pageIndex ? +pageIndex : undefined,
      searchTerm,
      convertToBoolean(getPendingWorkplaces),
    );

    const activeWorkplaceCount = childWorkplaces.count - childWorkplaces.pendingCount;

    const formattedChildWorkplaces = formatChildWorkplaces(childWorkplaces.rows);

    return res.status(200).json({
      childWorkplaces: formattedChildWorkplaces,
      count: childWorkplaces.count,
      activeWorkplaceCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const formatChildWorkplaces = (childWorkplaces) => {
  return childWorkplaces.map((workplace) => {
    return {
      dataOwner: workplace.dataOwner,
      dataOwnershipRequested: workplace.dataOwnershipRequested,
      dataPermissions: workplace.dataPermissions,
      mainService: workplace.mainService.name,
      name: workplace.NameValue,
      uid: workplace.uid,
      updated: workplace.updated,
      ustatus: workplace.ustatus,
      postcode: workplace.postcode,
    };
  });
};

const convertToBoolean = (getPendingWorkplaces) => {
  if (typeof getPendingWorkplaces === 'string') {
    if (getPendingWorkplaces === 'true') return true;
    if (getPendingWorkplaces === 'false') return false;
  }
  return true;
};

router.route('/').get(Authorization.isAuthorised, getChildWorkplaces);

module.exports = router;
module.exports.getChildWorkplaces = getChildWorkplaces;
module.exports.formatChildWorkplaces = formatChildWorkplaces;
