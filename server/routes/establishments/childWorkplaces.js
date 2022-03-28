const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');

const getChildWorkplaces = async (req, res) => {
  try {
    const { itemsPerPage, pageIndex, searchTerm } = req.query;

    const childWorkplaces = await models.establishment.getChildWorkplaces(
      req.params.id,
      itemsPerPage ? +itemsPerPage : undefined,
      pageIndex ? +pageIndex : undefined,
      searchTerm,
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
    };
  });
};

router.route('/').get(getChildWorkplaces);

module.exports = router;
module.exports.getChildWorkplaces = getChildWorkplaces;
module.exports.formatChildWorkplaces = formatChildWorkplaces;
