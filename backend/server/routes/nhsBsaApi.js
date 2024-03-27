const express = require('express');
const router = express.Router();
const models = require('../models');
// WDF effective date
const WdfCalculator = require('../models/classes/wdfCalculator').WdfCalculator;

const nhsBsaApi = async (req, res) => {
  try {
    const APiData = await models.establishment.nhsBsaApiData(true, 'Workplace');

    const workplaceData = await Promise.all(
      APiData.map(async (workplace) => {
        const wdfEligible = await wdfData(workplace.id);
        const child = await models.establishment.nhsBsaApiChildData(workplace.id);

        const x = await Promise.all(
          child.map(async (y) => {
            const wdfEligible = await wdfData(y.id);
            //const x = Object.assign({}, y);
            return {
              workplaceID: y.nmdsId,
              workplaceName: y.NameValue,
              workplaceAdress: y.address1,
              town: y.town,
              postCode: y.postcode,
              locationID: y.locationId,
              dataOwner: y.dataOwner,
              parentId: y.parentId,

              ...wdfEligible,
            };
          }),
        );

        // console.log(x);

        return {
          establishmentId: workplace.id,
          workplaceID: workplace.nmdsId,
          workplaceName: workplace.NameValue,
          workplaceAdress: workplace.address1,
          town: workplace.town,
          postCode: workplace.postcode,
          dataOwner: workplace.dataOwner,
          isParent: workplace.isParent,
          locationID: workplace.locationId,
          numberOfStaffValue: workplace.NumberOfStaffValue,
          serviceName: workplace.mainService.name,
          serviceCategory: workplace.mainService.category,
          ...wdfEligible,
          child: x,
        };
      }),
    );

    const subsidiaries = await models.establishment.nhsBsaApiData(false, 'Workplace');
    const result = await Promise.all(
      subsidiaries.map(async (workplace) => {
        const wdfEligible = await wdfData(workplace.id);
        return {
          workplaceID: workplace.nmdsId,
          workplaceName: workplace.NameValue,
          workplaceAdress: workplace.address1,
          town: workplace.town,
          postCode: workplace.postcode,
          dataOwner: workplace.dataOwner,
          isParent: workplace.isParent,
          locationID: workplace.locationId,
          numberOfStaffValue: workplace.NumberOfStaffValue,
          serviceName: workplace.mainService.name,
          serviceCategory: workplace.mainService.category,
          ...wdfEligible,
        };
      }),
    );
    const finalResult = workplaceData.concat(result);

    res.status(200);
    return res.json({
      finalResult,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
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
      Eligibalitypercentage: percentageEligibleWorkers,
      EligibalityDate: wdfMeeting.OverallWdfEligibility,
      isEligible:
        wdfMeeting.OverallWdfEligibility && wdfMeeting.OverallWdfEligibility.getTime() > WdfCalculator.effectiveTime
          ? 'Yes'
          : 'No',
    };
  }
};

router.route('/').get(nhsBsaApi);
module.exports = router;
module.exports.nhsBsaApi = nhsBsaApi;
