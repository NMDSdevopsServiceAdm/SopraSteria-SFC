// Sick Pay, Pension Contribution,Holiday
const sickPayHolidayAndPensionMapping = (value) => {
  if (value === "Don't know") {
    return 'unknown';
  } else if (value === 'No') {
    return 0;
  } else if (value === 'Yes') {
    return 1;
  } else if (!value) {
    return '';
  } else {
    return value;
  }
};

const extractPensionContributionPercentage = (entity) => {
  if (
    entity.pensionContribution !== 'Yes' ||
    !entity.pensionContributionPercentage ||
    typeof entity.pensionContributionPercentage !== 'number'
  ) {
    return '';
  }
  return entity.pensionContributionPercentage.toString();
};

const extractTravelTimePayRate = (entity) => {
  if (!entity.travelTimePayOption?.includeRate) {
    return '';
  }
  return entity.travelTimePayRate ? entity.travelTimePayRate.toString() : '';
};

const optOutPensionMapping = (staffOptOutOfWorkplacePension) => {
  switch (staffOptOutOfWorkplacePension) {
    case 'Yes':
      return '1';
    case 'No':
      return '2';
    case "Don't know":
      return '999';
    default:
      return '';
  }
};

const sleepInsMapping = optOutPensionMapping;

const extractSleepInPay = (entity) => {
  if (entity.offerSleepIn !== 'Yes') {
    return '';
  }

  switch (entity.howToPayForSleepIn) {
    case 'Hourly rate':
      return '1';
    case 'Flat rate':
      return '2';
    case 'I do not know':
      return '999';
    default:
      return '';
  }
};

module.exports = {
  sickPayHolidayAndPensionMapping,
  extractPensionContributionPercentage,
  sleepInsMapping,
  optOutPensionMapping,
  extractSleepInPay,
  extractTravelTimePayRate,
};
