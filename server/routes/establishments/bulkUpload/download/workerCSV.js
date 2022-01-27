const BUDI = require('../../../../models/BulkImport/BUDI').BUDI;
const get = require('lodash/get');

const csvQuote = (toCsv) => {
  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  }

  return toCsv;
};

const _maptoCSVregisteredNurse = (registeredNurse) => {
  switch (registeredNurse) {
    case 'Adult Nurse':
      return '01';
    case 'Mental Health Nurse':
      return '02';
    case 'Learning Disabilities Nurse':
      return '03';
    case "Children's Nurse":
      return '04';
    case 'Enrolled Nurse':
      return '05';
  }

  return '';
};

const toCSV = (establishmentId, entity, MAX_QUALIFICATIONS) => {
  // ["LOCALESTID","UNIQUEWORKERID","STATUS","DISPLAYID","FLUVAC","NINUMBER","POSTCODE","DOB","GENDER","ETHNICITY","NATIONALITY","BRITISHCITIZENSHIP","COUNTRYOFBIRTH","YEAROFENTRY","DISABLED",
  //     "CARECERT","RECSOURCE","STARTDATE","STARTINSECT","APPRENTICE","EMPLSTATUS","ZEROHRCONT","DAYSSICK","SALARYINT","SALARY","HOURLYRATE","MAINJOBROLE","MAINJRDESC","CONTHOURS","AVGHOURS",
  //     "OTHERJOBROLE","OTHERJRDESC","NMCREG","NURSESPEC","AMHP","SCQUAL","NONSCQUAL","QUALACH01","QUALACH01NOTES","QUALACH02","QUALACH02NOTES","QUALACH03","QUALACH03NOTES"];
  const columns = [];

  // "LOCALESTID"
  columns.push(establishmentId);

  // "UNIQUEWORKERID"
  columns.push(csvQuote(entity.LocalIdentifierValue)); // todo - this will be local identifier

  // "STATUS"
  columns.push('UNCHECKED');

  // "DISPLAYID"
  columns.push(csvQuote(entity.NameOrIdValue));

  // "FLUVAC"
  let fluvac = '';
  switch (entity.FluJabValue) {
    case 'Yes':
      fluvac = 1;
      break;

    case 'No':
      fluvac = 2;
      break;

    case "Don't know":
      fluvac = 999;
      break;
  }
  columns.push(fluvac);

  // "NINUMBER"
  columns.push(entity.NationalInsuranceNumberValue ? entity.NationalInsuranceNumberValue.replace(/\s+/g, '') : ''); // remove whitespace

  // "POSTCODE"
  columns.push(csvQuote(entity.PostcodeValue));

  // "DOB"
  const dobParts = entity.DateOfBirthValue ? entity.DateOfBirthValue.split('-') : null;
  columns.push(dobParts ? `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}` : ''); // in UK date format dd/mm/yyyy (Worker stores as YYYY-MM-DD)

  // "GENDER",
  let genderId = '';
  switch (entity.GenderValue) {
    case 'Female':
      genderId = 2;
      break;

    case 'Male':
      genderId = 1;
      break;

    case 'Other':
      genderId = 4;
      break;

    case "Don't know":
      genderId = 3;
      break;
  }
  columns.push(genderId);

  // "ETHNICITY"
  columns.push(get(entity, 'ethnicity.id') ? BUDI.ethnicity(BUDI.FROM_ASC, entity.ethnicity.id) : '');

  // "NATIONALITY"
  let nationality = '';
  switch (entity.NationalityValue) {
    case 'British':
      nationality = 826;
      break;
    case "Don't know":
      nationality = 998;
      break;
    case 'Other':
      nationality = get(entity, 'nationality.id') ? BUDI.nationality(BUDI.FROM_ASC, entity.nationality.id) : 999;
      break;
  }
  columns.push(nationality);

  // "BRITISHCITIZENSHIP"
  let britishCitizenship = '';
  switch (entity.BritishCitizenshipValue) {
    case 'Yes':
      britishCitizenship = 1;
      break;

    case 'No':
      britishCitizenship = 2;
      break;

    case "Don't know":
      britishCitizenship = 999;
      break;
  }
  columns.push(britishCitizenship);

  // "COUNTRYOFBIRTH"
  let countryOfBirth = '';
  switch (entity.CountryOfBirthValue) {
    case 'United Kingdom':
      countryOfBirth = 826;
      break;
    case "Don't know":
      countryOfBirth = 998;
      break;
    case 'Other':
      countryOfBirth = get(entity, 'countryOfBirth.id') ? BUDI.country(BUDI.FROM_ASC, entity.countryOfBirth.id) : 999;
      break;
  }
  columns.push(countryOfBirth);

  // "YEAROFENTRY"
  columns.push(entity.YearArrivedValue === 'Yes' ? entity.YearArrivedYear : '');

  // "DISABLED"
  let disability = '';
  switch (entity.DisabilityValue) {
    case 'Yes':
      disability = 1;
      break;

    case 'No':
      disability = 0;
      break;

    case 'Undisclosed':
      disability = 2;
      break;

    case "Don't know":
      disability = 3;
      break;
  }
  columns.push(disability);

  // "CARECERT"
  let careCert = '';
  switch (entity.CareCertificateValue) {
    case 'Yes, completed':
      careCert = 1;
      break;

    case 'No':
      careCert = 2;
      break;

    case 'Yes, in progress or partially completed':
      careCert = 3;
      break;
  }
  columns.push(careCert);

  // "RECSOURCE"
  let recruitmentSource = '';
  switch (entity.RecruitedFromValue) {
    case 'No':
      recruitmentSource = 16;
      break;
    case 'Yes':
      recruitmentSource = get(entity, 'recruitedFrom.id')
        ? BUDI.recruitment(BUDI.FROM_ASC, entity.recruitedFrom.id)
        : '';
      break;
  }
  columns.push(recruitmentSource);

  // "STARTDATE"
  const mainJobStartDateParts = entity.MainJobStartDateValue ? entity.MainJobStartDateValue.split('-') : null;

  columns.push(
    mainJobStartDateParts ? `${mainJobStartDateParts[2]}/${mainJobStartDateParts[1]}/${mainJobStartDateParts[0]}` : '',
  ); // in UK date format dd/mm/yyyy (Worker stores as YYYY-MM-DD)

  // "STARTINSECT"
  columns.push(entity.SocialCareStartDateValue === 'Yes' ? entity.SocialCareStartDateYear : '');

  // "APPRENTICE"
  let apprenticeship = '';
  switch (entity.ApprenticeshipTrainingValue) {
    case 'Yes':
      apprenticeship = 1;
      break;

    case 'No':
      apprenticeship = 2;
      break;

    case "Don't know":
      apprenticeship = 999;
      break;
  }
  columns.push(apprenticeship);

  // EMPLSTATUS/;contract - mandatory
  let empStatus = '';
  switch (entity.ContractValue) {
    case 'Permanent':
      empStatus = 1;
      break;

    case 'Temporary':
      empStatus = 2;
      break;

    case 'Pool/Bank':
      empStatus = 3;
      break;

    case 'Agency':
      empStatus = 4;
      break;

    case 'Other':
      empStatus = 7;
      break;
  }
  columns.push(empStatus);

  // "ZEROHRCONT"
  let zeroHours = '';
  switch (entity.ZeroHoursContractValue) {
    case 'Yes':
      zeroHours = 1;
      break;

    case 'No':
      zeroHours = 2;
      break;

    case "Don't know":
      zeroHours = 999;
      break;
  }
  columns.push(zeroHours);

  // "DAYSSICK"
  let daysSick = '';
  switch (entity.DaysSickValue) {
    case 'No':
      daysSick = 999;
      break;
    case 'Yes':
      daysSick = entity.DaysSickDays;
      break;
  }
  columns.push(daysSick);

  switch (entity.AnnualHourlyPayValue) {
    case 'Hourly':
      // "SALARYINT"
      columns.push(3);
      // "SALARY"
      columns.push('');
      // "HOURLYRATE"
      columns.push(entity.AnnualHourlyPayRate);
      break;
    case 'Annually':
      // "SALARYINT"
      columns.push(1);
      // "SALARY"
      columns.push(entity.AnnualHourlyPayRate);
      // "HOURLYRATE"
      columns.push('');
      break;
    default:
      // "SALARYINT"
      columns.push('');
      // "SALARY"
      columns.push('');
      // "HOURLYRATE"
      columns.push('');
  }

  // "MAINJOBROLE"
  columns.push(get(entity, 'mainJob.id') ? BUDI.jobRoles(BUDI.FROM_ASC, entity.mainJob.id) : '');

  // "MAINJRDESC"
  columns.push(get(entity, 'mainJob.other') && entity.mainJob.other ? entity.MainJobFkOther : '');

  // "CONTHOURS"
  // if no contracted hours, then output empty (null)
  // if no contract type, or contract type is not contractedHoursContract, then always empty (null)
  let contHours = '';
  if (['Permanent', 'Temporary'].includes(entity.ContractValue) && entity.ZeroHoursContractValue !== 'Yes') {
    switch (entity.WeeklyHoursContractedValue) {
      case 'Yes':
        // if contracted hours is 'Yes', then the contracted hours value - which itself could still be empty (null)
        contHours = entity.WeeklyHoursContractedHours;
        break;

      case 'No':
        // if contracted hours is 'No', then output "999" (don't know)
        contHours = 999;
        break;
    }
  }
  columns.push(contHours);

  // "AVGHOURS"
  let avgHours = ''; // if no average hours, then output empty (null)
  if (['Pool/Bank', 'Agency', 'Other'].includes(entity.ContractValue) || entity.ZeroHoursContractValue === 'Yes') {
    switch (entity.WeeklyHoursAverageValue) {
      case 'Yes':
        // if average hours is 'Yes', then the average hours value - which itself could still be empty (null)
        avgHours = entity.WeeklyHoursAverageHours;
        break;

      case 'No':
        // if average hours is 'No', then output "999" (don't know)
        avgHours = 999;
        break;
    }
  }
  columns.push(avgHours);

  // "OTHERJOBROLE"
  columns.push(
    entity.OtherJobsValue === 'Yes'
      ? entity.otherJobs.map((thisJob) => BUDI.jobRoles(BUDI.FROM_ASC, thisJob.id)).join(';')
      : '',
  );

  // "OTHERJRDESC"
  columns.push(
    entity.OtherJobsValue === 'Yes'
      ? entity.otherJobs
          .map((thisJob) => (thisJob.other && thisJob.workerJobs.other ? thisJob.workerJobs.other : ''))
          .join(';')
      : '',
  );

  const NURSE_JOB_ID = 23;

  // "NMCREG"
  columns.push(
    get(entity, 'mainJob.id') && entity.mainJob.id === NURSE_JOB_ID
      ? _maptoCSVregisteredNurse(entity.RegisteredNurseValue)
      : '',
  );

  // "NURSESPEC"
  if (get(entity, 'mainJob.id') && entity.mainJob.id === NURSE_JOB_ID && entity.NurseSpecialismsValue) {
    if (entity.NurseSpecialismsValue === 'No') {
      columns.push(BUDI.nursingSpecialist(BUDI.FROM_ASC, 7));
    } else if (entity.NurseSpecialismsValue === "Don't know") {
      columns.push(BUDI.nursingSpecialist(BUDI.FROM_ASC, 8));
    } else if (entity.NurseSpecialismsValue === 'Yes') {
      columns.push(
        entity.nurseSpecialisms
          .map((thisSpecialism) => BUDI.nursingSpecialist(BUDI.FROM_ASC, thisSpecialism.id))
          .join(';'),
      );
    }
  } else {
    columns.push('');
  }

  // "AMHP"
  let amhp = '';
  switch (entity.ApprovedMentalHealthWorkerValue) {
    case 'Yes':
      amhp = 1;
      break;

    case 'No':
      amhp = 2;
      break;

    case "Don't know":
      amhp = 999;
      break;
  }
  columns.push(amhp);

  // "SCQUAL"
  let scqual = '';
  switch (entity.QualificationInSocialCareValue) {
    case 'Yes':
      {
        const budi = entity.socialCareQualification
          ? BUDI.qualificationLevels(BUDI.FROM_ASC, entity.socialCareQualification.id)
          : null;

        if (budi !== null) {
          scqual = '1;' + budi;
        } else {
          scqual = '1';
        }
      }
      break;

    case 'No':
      scqual = 2;
      break;

    case "Don't know":
      scqual = 999;
      break;
  }
  columns.push(scqual);

  // "NONSCQUAL"
  let nonscqual = '';
  switch (entity.OtherQualificationsValue) {
    case 'Yes':
      {
        const budi = entity.highestQualification
          ? BUDI.qualificationLevels(BUDI.FROM_ASC, entity.highestQualification.id)
          : null;

        if (budi !== null) {
          nonscqual = '1;' + budi;
        } else {
          nonscqual = '1';
        }
      }
      break;

    case 'No':
      nonscqual = 2;
      break;

    case "Don't know":
      nonscqual = 999;
      break;
  }
  columns.push(nonscqual);

  const myQualifications = entity.qualifications.slice(0, MAX_QUALIFICATIONS);
  const len = Math.max(3, Math.min(myQualifications.length, MAX_QUALIFICATIONS));

  for (let index = 0; index < len; index++) {
    const thisQual = myQualifications[index];
    const mappedQualification = thisQual ? BUDI.qualifications(BUDI.FROM_ASC, thisQual.qualification.id) : null;

    if (mappedQualification) {
      columns.push(`${mappedQualification};${thisQual.year ? thisQual.year : ''}`);
      columns.push(csvQuote(thisQual.notes ? unescape(thisQual.notes) : ''));
    } else {
      columns.push('');
      columns.push('');
    }
  }

  return columns.join(',');
};

module.exports = {
  toCSV,
  csvQuote,
  _maptoCSVregisteredNurse,
};
