'use strict';
const router = require('express').Router();
const moment = require('moment');
const CQCDataAPI = require('../../utils/CQCDataAPI');
const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');

const missingCqcProviderLocations = async (req, res) => {
  const locationId = req.query.locationId;
  const establishmentUid = req.query.establishmentUid;
  const establishmentId = req.query.establishmentId;
  let weeksSinceParentApproval = null;

  const result = {
    weeksSinceParentApproval: null,
    childWorkplacesCount: 0,
  };

  try {
    const childWorkplaces = await models.establishment.getChildWorkplaces(establishmentUid);
    result.childWorkplacesCount = childWorkplaces.count;

    if (establishmentId) {
      const parentApproval = await models.Approvals.findbyEstablishmentId(establishmentId, 'BecomeAParent', 'Approved');

      weeksSinceParentApproval = getWeeksSinceParentApproval(parentApproval);
      result.weeksSinceParentApproval = weeksSinceParentApproval;
    }

    if (locationId) {
      let CQCProviderData = await CQCDataAPI.getCQCProviderData(locationId);

      const childWorkplacesLocationIds = await getChildWorkplacesLocationIds(childWorkplaces.rows);

      const missingCqcLocations = await findMissingCqcLocationIds(
        CQCProviderData?.locationIds,
        childWorkplacesLocationIds,
      );

      result.showMissingCqcMessage = hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval(
        weeksSinceParentApproval,
        missingCqcLocations.count,
      );
      result.missingCqcLocations = missingCqcLocations;
    } else {
      result.showMissingCqcMessage = false;

      result.missingCqcLocations = { count: 0, missingCqcLocationIds: [] };
    }
  } catch (error) {
    result.showMissingCqcMessage = false;
    result.missingCqcLocations = { count: 0, missingCqcLocationIds: [] };
  }
  return res.status(200).send(result);
};

const getWeeksSinceParentApproval = (parentApproval) => {
  if (!parentApproval) return null;

  const dateNow = moment();
  let dateOfParentApproval = moment(parentApproval.updatedAt);
  return dateNow.diff(dateOfParentApproval, 'weeks');
};

const getChildWorkplacesLocationIds = async (childWorkplaces) => {
  let childWorkplacesLocationIds = [];
  childWorkplaces.map((childWorkplace) =>
    childWorkplace.locationId ? childWorkplacesLocationIds.push(childWorkplace.locationId) : null,
  );
  return childWorkplacesLocationIds;
};

const findMissingCqcLocationIds = async (cqcLocationIds, childWorkplacesLocationIds) => {
  let missingCqcLocations = {};
  missingCqcLocations.count = 0;
  missingCqcLocations.missingCqcLocationIds = [];

  cqcLocationIds.map((cqcLocationId) => {
    if (childWorkplacesLocationIds.includes(cqcLocationId)) {
      missingCqcLocations.count;
    } else {
      missingCqcLocations.count = missingCqcLocations.count + 1;
      missingCqcLocations.missingCqcLocationIds.push(cqcLocationId);
    }
  });

  return missingCqcLocations;
};

const hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval = (weeksSinceParentApproval, missingCqcLocationsCount) => {
  return weeksSinceParentApproval >= 8 && missingCqcLocationsCount > 5;
};

router.route('/').get(Authorization.isAuthorised, missingCqcProviderLocations);

module.exports = router;
module.exports.missingCqcProviderLocations = missingCqcProviderLocations;
module.exports.getWeeksSinceParentApproval = getWeeksSinceParentApproval;
module.exports.getChildWorkplacesLocationIds = getChildWorkplacesLocationIds;
module.exports.findMissingCqcLocationIds = findMissingCqcLocationIds;
module.exports.hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval =
  hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval;
