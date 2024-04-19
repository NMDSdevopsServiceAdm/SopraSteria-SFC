const express = require('express');
const router = express.Router();
const models = require('../../models');
const authorization = require('../../utils/middleware/isNHSBSAAuthenticated');
const rateLimiter = require('../../utils/middleware/rateLimitingNHSBSAAPI');
// WDF effective date
const WdfCalculator = require('../../models/classes/wdfCalculator').WdfCalculator;

const nhsBsaApi = async (req, res) => {
  const workplaceId = req.params.workplaceId;

  const workplaceID = await models.establishment.getWorkplaceId(workplaceId);
  if (!workplaceID) return res.status(404).json({ error: 'Can not find this Id.' });

  const where = {
    nmdsId: workplaceId,
  };

  try {
    const workplaceDetail = await models.establishment.getNhsBsaApiDataByWorkplaceId(where);

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
  const wdfEligible = await wdfData(workplace.id);

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
    ...wdfEligible,
  };
};

const subsidiariesList = async (establishmentId) => {
  const subs = await models.establishment.getNhsBsaApiDataForSubs(establishmentId);

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

const wdfData = async (workplaceId) => {
  const effectiveFrom = WdfCalculator.effectiveDate;

  const reportData = await models.sequelize.query(`select * from cqc.wdfsummaryreport(:givenEffectiveDate)`, {
    replacements: {
      givenEffectiveDate: effectiveFrom,
    },
    type: models.sequelize.QueryTypes.SELECT,
  });

  const wdfMeeting = reportData.find((workplace) => workplace.EstablishmentID === workplaceId);
  if (wdfMeeting) {
    const percentageEligibleWorkers =
      wdfMeeting.WorkerCount > 0 ? Math.floor((wdfMeeting.WorkerCompletedCount / wdfMeeting.WorkerCount) * 100) : 0;

    return {
      eligibilityPercentage: percentageEligibleWorkers,
      eligibilityDate: wdfMeeting.OverallWdfEligibility,
      isEligible:
        wdfMeeting.OverallWdfEligibility && wdfMeeting.OverallWdfEligibility.getTime() > WdfCalculator.effectiveTime
          ? 'true'
          : 'false',
    };
  }
};

router.route('/:workplaceId').get(rateLimiter, authorization.isAuthorised, nhsBsaApi);
module.exports = router;
module.exports.nhsBsaApi = nhsBsaApi;


