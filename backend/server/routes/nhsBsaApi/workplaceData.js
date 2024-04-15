const express = require('express');
const router = express.Router();
const models = require('../../models');
const Authorization = require('../../utils/middleware/isNHSBSAAuthenticated');
// WDF effective date
const WdfCalculator = require('../../models/classes/wdfCalculator').WdfCalculator;

const nhsBsaApi = async (req, res) => {
  const workplaceId = req.params.workplaceId;
  const where = {
    nmdsId: workplaceId ?  {nmdsId: workplaceId} :{ locationId: locationID},
  }

  try {
    const workplaceDetail = await models.establishment.nhsBsaApiData(where);

    const workplaceData = await Promise.all(
      workplaceDetail.map(async (workplace) => {
        const isParent = workplace.isParent;
        const establishmentId = workplace.id;
        const parentId = workplace.parentId;

        if (isParent) {
          return {
            isParent: workplace.isParent,
            workplaceDetails: await workplaceObject(workplace),
            subsidiaries: await subsidiariesList(establishmentId),
          };
        } else if (parentId) {
          return {
            workplaceDetails: await workplaceObject(workplace),
            parent: await parentList(parentId),
          };
        } else {
          return {
            workplaceDetails: await workplaceObject(workplace),
          };
        }
      }),
    );

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
  const where = {
    parentId: establishmentId,
  };
  const subs = await models.establishment.nhsBsaApiData(where);

  const subsidiaries = await Promise.all(
    subs.map(async (workplace) => {
      return await workplaceObject(workplace);
    }),
  );
  return subsidiaries;
};

const parentList = async (parentId) => {
  const where = {
    id: parentId,
  };
  const subs = await models.establishment.nhsBsaApiData(where);

  const parentData = await Promise.all(
    subs.map(async (workplace) => {
      return await workplaceObject(workplace);
    }),
  );
  return parentData;
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

router.route('/:workplaceId').get(Authorization.isAuthorised, nhsBsaApi);
module.exports = router;
module.exports.nhsBsaApi = nhsBsaApi;
