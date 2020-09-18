const { build, fake, sequence, oneOf } = require('@jackfranklin/test-data-bot');
const moment = require('moment');
const EstablishmentData = build('LocalAuthorityReportEstablishmentData', {
  fields: {
    id: 10,
    reportFrom: moment().subtract(7, 'd').format('YYYY-MM-DD'),
    reportTo: moment().add(7, 'd').format('YYYY-MM-DD'),
    establishmentFk: sequence(),
    workplaceFk: sequence(),
    workplaceName: fake((f) => f.company.companyName()),
    workplaceId: fake((f) => f.helpers.replaceSymbolWithNumber('F#######')),
    lastUpdated: moment().format('YYYY-MM-DD'),
    establishmentType: 'Local Authority (adult services)',
    mainService: 'Carers support',
    serviceUserGroups: 'Completed',
    capacityOfMainService: 'n/a',
    utilisationOfMainService: 'n/a',
    numberOfVacancies: 'Missing',
    numberOfStarters: 'Missing',
    numberOfLeavers: 'Missing',
    numberOfStaffRecords: 'Missing',
    workplaceComplete: false,
    numberOfIndividualStaffRecords: '15',
    percentageOfStaffRecords: '15.2',
    numberOfStaffRecordsNotAgency: 15,
    numberOfCompleteStaffNotAgency: 1,
    percentageOfCompleteStaffRecords: '6.7',
    numberOfAgencyStaffRecords: 0,
    numberOfCompleteAgencyStaffRecords: 0,
    percentageOfCompleteAgencyStaffRecords: '0.0',
  },
});

const WorkerData = build('LocalAuthorityReportWorkerData', {
  fields: {
    id: sequence(),
    establishmentFk: sequence(),
    workerFK: sequence(),
    localId: fake((f) => f.lorem.word()),
    workplaceName: fake((f) => f.company.companyName()),
    workplaceId: fake((f) => f.helpers.replaceSymbolWithNumber('F#######')),
    gender: oneOf('Missing', 'male', 'female', 'other'),
    dateOfBirth: oneOf('Missing', moment(fake((f) => f.date.past(30))).format('YYYY-MM-DD')),
    ethnicity: 'Missing',
    mainJob: 'Activities worker or co-ordinator',
    employmentStatus: 'Permanent',
    contractedAverageHours: 'Missing',
    sickDays: 'Missing',
    payInterval: 'Missing',
    rateOfPay: 'Missing',
    relevantSocialCareQualification: 'Missing',
    highestSocialCareQualification: 'Missing',
    nonSocialCareQualification: 'Missing',
    lastUpdated: moment().format('YYYY-MM-DD'),
    staffRecordComplete: false,
  },
});

LocalAuthorityReportDataBuilder = build('LocalAuthorityReportData', {
  fields: {
    date: new Date().toISOString(),
    reportEstablishment: {
      name: fake((f) => f.company.companyName()),
      nmdsId: fake((f) => f.helpers.replaceSymbolWithNumber('F#######')),
      localAuthority: 'Manchester',
    },

    establishments: [EstablishmentData(), EstablishmentData()],
    workers: [WorkerData(), WorkerData(), WorkerData(), WorkerData(), WorkerData()],
  },
});

module.exports.LocalAuthorityReportDataBuilder = LocalAuthorityReportDataBuilder;
