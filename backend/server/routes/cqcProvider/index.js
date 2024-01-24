'use strict';
const router = require('express').Router();
const moment = require('moment');
const CQCProviderDataAPI = require('../../utils/CQCProviderDataAPI');
const { celebrate, Joi, errors } = require('celebrate');
const models = require('../../models');
const { getChildWorkplaces, formatChildWorkplaces } = require('../../routes/establishments/childWorkplaces');

const cqcProvider = async (req, res) => {
  const locationID = req.params.locationID;
  const establishmentUid = req.query.establishmentUid;
  const establishmentId = req.query.establishmentId;
  const itemsPerPage = 10;
  const pageIndex = 0;
  const searchTerm = 'sab';

  const result = {};

  try {
    let CQCProviderData = await CQCProviderDataAPI.getCQCProviderData(locationID);

    if (cqcProvider) {
      const childWorkplaces = await models.establishment.getChildWorkplaces(
        establishmentUid,
        itemsPerPage,
        pageIndex,
        // searchTerm,
      );

      const weeksSinceParentApproval = await getWeeksSinceParentApproval(establishmentId);

      const childWorkplacesLocationIds = await getChildWorkplacesLocationIds(childWorkplaces.rows);

      const missingMissCqcLocations = await findMissingCqcLocationIds(
        CQCProviderData.locationIds,
        childWorkplacesLocationIds,
      );

      result.weeksSinceParentApproval = weeksSinceParentApproval;
      result.missingMissCqcLocations = missingMissCqcLocations;
    }
  } catch (error) {
    console.error('CQC Provider API Error: ', error);
    result.weeksSinceParentApproval = 0;
    result.missingMissCqcLocations = { count: 0, missingMissCqcLocationIds: [] };
  }
  return res.status(200).send(result);
};

router.route('/:locationID').get(
  cqcProvider,
  celebrate({
    query: Joi.object().keys({
      locationID: Joi.string().required(),
      establishmentUid: Joi.string().required(),
    }),
  }),
);

const getWeeksSinceParentApproval = async (establishmentId) => {
  try {
    const dateNow = moment();
    const parentApproval = await models.Approvals.findbyEstablishmentId(establishmentId, 'BecomeAParent', 'Approved');
    let dateOfParentApproval = moment(parentApproval.updatedAt);
    return dateNow.diff(dateOfParentApproval, 'weeks');
  } catch {
    console.error();
  }
};

const getChildWorkplacesLocationIds = async (childWorkplaces) => {
  let childWorkplacesLocationIds = [];
  childWorkplaces.map((childWorkplace) =>
    childWorkplace.locationId ? childWorkplacesLocationIds.push(childWorkplace.locationId) : null,
  );
  return childWorkplacesLocationIds;
};

const findMissingCqcLocationIds = async (cqcLocationIds, childWorkplacesLocationIds) => {
  let missingMissCqcLocations = {};
  missingMissCqcLocations.count = 0;
  missingMissCqcLocations.missingMissCqcLocationIds = [];

  cqcLocationIds.map((cqcLocationId) => {
    if (childWorkplacesLocationIds.includes(cqcLocationId)) {
      missingMissCqcLocations.count;
    } else {
      missingMissCqcLocations.count = missingMissCqcLocations.count + 1;
      missingMissCqcLocations.missingMissCqcLocationIds.push(cqcLocationId);
    }
  });

  return missingMissCqcLocations;
};

router.use('/:locationID', errors());

module.exports = router;
module.exports.cqcProvider = cqcProvider;
module.exports.getWeeksSinceParentApproval = getWeeksSinceParentApproval;
module.exports.getChildWorkplacesLocationIds = getChildWorkplacesLocationIds;
module.exports.findMissingCqcLocationIds = findMissingCqcLocationIds;
