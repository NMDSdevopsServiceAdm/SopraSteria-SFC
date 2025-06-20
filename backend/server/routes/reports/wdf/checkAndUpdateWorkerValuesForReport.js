const moment = require('moment');
const { WdfCalculator } = require('../../../models/classes/wdfCalculator');

const updateProps = (
  'DateOfBirthValue,GenderValue,NationalityValue,MainJobStartDateValue,' +
  'RecruitedFromValue,WeeklyHoursContractedValue,ZeroHoursContractValue,' +
  'DaysSickValue,AnnualHourlyPayValue,AnnualHourlyPayRate,CareCertificateValue,QualificationInSocialCareValue,QualificationInSocialCare,OtherQualificationsValue'
).split(',');

const checkAndUpdateWorkerValuesForReport = async (workerData) => {
  workerData.forEach((value) => {
    if (value.QualificationInSocialCareValue === 'No' || value.QualificationInSocialCareValue === "Don't know") {
      value.QualificationInSocialCare = 'N/A';
    }
    if (value.AnnualHourlyPayRate === "Don't know" || value.AnnualHourlyPayValue === "Don't know") {
      value.AnnualHourlyPayRate = 'N/A';
    }
    if (value.DaysSickValue === 'No') {
      value.DaysSickValue = "Don't know";
    } else if (value.DaysSickValue === 'Yes') {
      value.DaysSickValue = value.DaysSickDays;
    }

    if (value.RecruitedFromValue === 'No') {
      value.RecruitedFromValue = "Don't know";
    } else if (value.RecruitedFromValue === 'Yes') {
      value.RecruitedFromValue = value.From;
    }

    if (value.NationalityValue === 'Other' && value.Nationality) {
      value.NationalityValue = value.Nationality;
    }

    if (
      (value.ContractValue === 'Permanent' || value.ContractValue === 'Temporary') &&
      value.ZeroHoursContractValue === 'No'
    ) {
      if (value.WeeklyHoursContractedValue === 'Yes') {
        value.HoursValue = value.WeeklyHoursContractedHours;
      } else if (value.WeeklyHoursContractedValue === 'No') {
        value.HoursValue = "Don't know";
      } else if (value.WeeklyHoursContractedValue === null) {
        value.HoursValue = 'Missing';
      }
    } else {
      if (value.WeeklyHoursAverageValue === 'Yes') {
        value.HoursValue = value.WeeklyHoursAverageHours;
      } else if (value.WeeklyHoursAverageValue === 'No') {
        value.HoursValue = "Don't know";
      } else if (value.WeeklyHoursAverageValue === null) {
        value.HoursValue = 'Missing';
      }
    }

    const effectiveFromIso = WdfCalculator.effectiveDate.toISOString();
    value.WdfEligible = value.WdfEligible && moment(value.LastWdfEligibility).isAfter(effectiveFromIso);

    if (value.ContractValue === 'Agency' || value.ContractValue === 'Pool/Bank') {
      value.DaysSickValue = 'N/A';
    }

    updateProps.forEach((prop) => {
      if (value[prop] === null) {
        value[prop] = 'Missing';
      }
    });
  });

  return workerData;
};

module.exports = { checkAndUpdateWorkerValuesForReport, updateProps };