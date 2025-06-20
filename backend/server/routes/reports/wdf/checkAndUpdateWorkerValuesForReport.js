const moment = require('moment');
const { WdfCalculator } = require('../../../models/classes/wdfCalculator');

const updateProps = [
  'DateOfBirthValue',
  'GenderValue',
  'NationalityValue',
  'MainJobStartDateValue',
  'RecruitedFromValue',
  'WeeklyHoursContractedValue',
  'ZeroHoursContractValue',
  'DaysSickValue',
  'AnnualHourlyPayValue',
  'AnnualHourlyPayRate',
  'CareCertificateValue',
  'QualificationInSocialCareValue',
  'QualificationInSocialCare',
  'OtherQualificationsValue',
];

const checkAndUpdateWorkerValuesForReport = (workerData) => {
  const effectiveFromIso = WdfCalculator.effectiveDate.toISOString();

  workerData.forEach((value) => {
    if (value.QualificationInSocialCareValue === 'No' || value.QualificationInSocialCareValue === "Don't know") {
      value.QualificationInSocialCare = 'N/A';
    }

    if (value.AnnualHourlyPayRate === "Don't know" || value.AnnualHourlyPayValue === "Don't know") {
      value.AnnualHourlyPayRate = 'N/A';
    }

    value.DaysSickValue =
      checkValueForUpdatingProperty({ valueToCheck: value.DaysSickValue, propertyToReturnIfYes: value.DaysSickDays }) ??
      value.DaysSickValue;

    value.RecruitedFromValue =
      checkValueForUpdatingProperty({ valueToCheck: value.RecruitedFromValue, propertyToReturnIfYes: value.From }) ??
      value.RecruitedFromValue;

    if (value.NationalityValue === 'Other' && value.Nationality) {
      value.NationalityValue = value.Nationality;
    }

    if (
      (value.ContractValue === 'Permanent' || value.ContractValue === 'Temporary') &&
      value.ZeroHoursContractValue === 'No'
    ) {
      value.HoursValue = checkValueForUpdatingProperty({
        valueToCheck: value.WeeklyHoursContractedValue,
        propertyToReturnIfYes: value.WeeklyHoursContractedHours,
      });
    } else {
      value.HoursValue = checkValueForUpdatingProperty({
        valueToCheck: value.WeeklyHoursAverageValue,
        propertyToReturnIfYes: value.WeeklyHoursAverageHours,
      });
    }

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

const checkValueForUpdatingProperty = ({ valueToCheck, propertyToReturnIfYes }) => {
  if (valueToCheck === 'Yes') {
    return propertyToReturnIfYes;
  } else if (valueToCheck === 'No') {
    return "Don't know";
  } else if (valueToCheck === null) {
    return 'Missing';
  }
};

module.exports = { checkAndUpdateWorkerValuesForReport, updateProps };
