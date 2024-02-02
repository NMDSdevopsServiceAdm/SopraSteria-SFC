'use strict';
const router = require('express').Router();
const moment = require('moment');
const CQCProviderDataAPI = require('../../utils/CQCProviderDataAPI');
const { celebrate, Joi, errors } = require('celebrate');
const models = require('../../models');

const missingCqcProviderLocations = async (req, res) => {
  const locationID = req.params.locationID;
  const establishmentUid = req.query.establishmentUid;
  const establishmentId = req.query.establishmentId;
  const itemsPerPage = 20;
  const pageIndex = 0;

  const result = {};

  try {
    let CQCProviderData = await CQCProviderDataAPI.getCQCProviderData(locationID);

    if (missingCqcProviderLocations) {
      const childWorkplaces = await models.establishment.getChildWorkplaces(establishmentUid, itemsPerPage, pageIndex);

      const parentApproval = await models.Approvals.findbyEstablishmentId(establishmentId, 'BecomeAParent', 'Approved');

      const weeksSinceParentApproval = await getWeeksSinceParentApproval(parentApproval);

      const childWorkplacesLocationIds = await getChildWorkplacesLocationIds(childWorkplaces.rows);

      const missingCqcLocations = await findMissingCqcLocationIds(
        CQCProviderData?.locationIds,
        childWorkplacesLocationIds,
      );

      result.showMissingCqcMessage = await checkMissingWorkplacesAndParentApprovalRule(
        weeksSinceParentApproval,
        missingCqcLocations.count,
      );

      result.weeksSinceParentApproval = weeksSinceParentApproval;
      result.missingCqcLocations = missingCqcLocations;
    }
  } catch (error) {
    console.error('CQC Provider API Error: ', error);
    result.showMissingCqcMessage = false;
    result.weeksSinceParentApproval = 0;
    result.missingCqcLocations = { count: 0, missingCqcLocationIds: [] };
  }
  return res.status(200).send(result);
};

router.route('/:locationID').get(
  missingCqcProviderLocations,
  celebrate({
    query: Joi.object().keys({
      locationID: Joi.string().required(),
      establishmentUid: Joi.string().required(),
    }),
  }),
);

const getWeeksSinceParentApproval = async (parentApproval) => {
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

const checkMissingWorkplacesAndParentApprovalRule = async (weeksSinceParentApproval, missingCqcLocationsCount) => {
  if (weeksSinceParentApproval >= 8 && missingCqcLocationsCount > 5) {
    return true;
  }
  return false;
};

router.use('/:locationID', errors());

module.exports = router;
module.exports.missingCqcProviderLocations = missingCqcProviderLocations;
module.exports.getWeeksSinceParentApproval = getWeeksSinceParentApproval;
module.exports.getChildWorkplacesLocationIds = getChildWorkplacesLocationIds;
module.exports.findMissingCqcLocationIds = findMissingCqcLocationIds;
module.exports.checkMissingWorkplacesAndParentApprovalRule = checkMissingWorkplacesAndParentApprovalRule;
