const express = require('express');
const router = express.Router();
const models = require('../../models');
const authorization = require('../../utils/middleware/isNHSBSAAuthenticated');
const { authLimiter } = require('../../utils/middleware/rateLimitingNHSBSAAPI');
// WDF effective date
const WdfCalculator = require('../../models/classes/wdfCalculator').WdfCalculator;

const nhsBsaApi = async (req, res) => {
  const workplaceId = req.params.workplaceId;

  try {
    const workplaceDetail = await models.establishment.getNhsBsaApiDataByWorkplaceId(workplaceId);
    if (!workplaceDetail) return res.status(404).json({ error: 'Can not find this Id.' });

    const isParent = workplaceDetail.isParent;
    const establishmentId = workplaceDetail.id;
    const parentId = workplaceDetail.parentId;

    let workplaceData = null;

    if (isParent) {
      workplaceData = {
        isParent: workplaceDetail.isParent,
        workplaceDetails: await workplaceObject(workplaceDetail),
        subsidiaries: await subsidiariesList(establishmentId),
      };
    } else if (parentId) {
      workplaceData = {
        workplaceDetails: await workplaceObject(workplaceDetail),
        parentWorkplace: await parentWorkplace(parentId),
      };
    } else {
      workplaceData = {
        workplaceDetails: await workplaceObject(workplaceDetail),
      };
    }

    res.status(200);
    return res.json({
      workplaceData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const workplaceObject = async (workplace) => {
  return {
    workplaceId: workplace.nmdsId,
    workplaceName: workplace.NameValue,
    dataOwner: workplace.dataOwner,
    workplaceAddress: {
      firstLine: workplace.address1,
      town: workplace.town,
      postCode: workplace.postcode,
    },
    locationId: workplace.locationId,
    numberOfWorkplaceStaff: workplace.NumberOfStaffValue,
    serviceName: workplace.mainService.name,
    serviceCategory: workplace.mainService.category,
    eligibilityPercentage: calculatePercentageOfWorkersEligible(workplace.workers),
    eligibilityDate: workplace.overallWdfEligibility,
    isEligible: workplaceIsEligible(workplace),
  };
};

const workplaceIsEligible = (workplace) => {
  return workplace.overallWdfEligibility && workplace.overallWdfEligibility.getTime() > WdfCalculator.effectiveDate
    ? true
    : false;
};

const subsidiariesList = async (parentId) => {
  const subs = await models.establishment.getNhsBsaApiDataForSubs(parentId);

  const subsidiaries = await Promise.all(
    subs.map(async (workplace) => {
      return await workplaceObject(workplace);
    }),
  );
  return subsidiaries;
};

const parentWorkplace = async (parentId) => {
  const where = {
    id: parentId,
  };
  const parentWorkplace = await models.establishment.getNhsBsaApiDataByWorkplaceId(where);

  return await workplaceObject(parentWorkplace);
};

const calculatePercentageOfWorkersEligible = (workers) => {
  const numberOfWorkers = workers?.length;

  if (!numberOfWorkers) return 0;
  const numberOfEligibleWorkers = workers.filter((worker) => worker.get('WdfEligible')).length;

  return Math.floor((numberOfEligibleWorkers / numberOfWorkers) * 100);
};

router.route('/:workplaceId').get(authLimiter, authorization.isAuthorised, nhsBsaApi);
module.exports = router;
module.exports.nhsBsaApi = nhsBsaApi;
module.exports.subsidiariesList = subsidiariesList;
