const dayjs = require('dayjs');
const { Op } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const Worker = sequelize.define(
    'worker',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      uid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: '"WorkerUID"',
      },
      LocalIdentifierValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true,
        field: '"LocalIdentifierValue"',
      },
      LocalIdentifierSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LocalIdentifierSavedAt"',
      },
      LocalIdentifierChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LocalIdentifierChangedAt"',
      },
      LocalIdentifierSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LocalIdentifierSavedBy"',
      },
      LocalIdentifierChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"LocalIdentifierChangedBy"',
      },
      establishmentFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"EstablishmentFK"',
      },
      EstablishmentFkSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EstablishmentFkSavedAt"',
      },
      EstablishmentFkChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EstablishmentFkChangedAt"',
      },
      EstablishmentFkSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EstablishmentFkSavedBy"',
      },
      EstablishmentFkChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EstablishmentFkChangedBy"',
      },
      lastWdfEligibility: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LastWdfEligibility"',
      },
      wdfEligible: {
        type: DataTypes.BOOLEAN,
        field: '"WdfEligible"',
      },
      NameOrIdValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        len: [0, 50],
        field: '"NameOrIdValue"',
      },
      NameOrIdSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NameOrIdSavedAt"',
      },
      NameOrIdChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NameOrIdChangedAt"',
      },
      NameOrIdSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NameOrIdSavedBy"',
      },
      NameOrIdChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NameOrIdChangedBy"',
      },
      ContractValue: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'],
        field: '"ContractValue"',
      },
      ContractSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ContractSavedAt"',
      },
      ContractChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ContractChangedAt"',
      },
      ContractSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ContractSavedBy"',
      },
      ContractChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ContractChangedBy"',
      },
      MainJobFkValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"MainJobFKValue"',
      },
      MainJobFkSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainJobFKSavedAt"',
      },
      MainJobFkChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainJobFKChangedAt"',
      },
      MainJobFkSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MainJobFKSavedBy"',
      },
      MainJobFkChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MainJobFKChangedBy"',
      },
      ApprovedMentalHealthWorkerValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"ApprovedMentalHealthWorkerValue"',
      },
      ApprovedMentalHealthWorkerSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ApprovedMentalHealthWorkerSavedAt"',
      },
      ApprovedMentalHealthWorkerChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ApprovedMentalHealthWorkerChangedAt"',
      },
      ApprovedMentalHealthWorkerSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ApprovedMentalHealthWorkerSavedBy"',
      },
      ApprovedMentalHealthWorkerChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ApprovedMentalHealthWorkerChangedBy"',
      },
      MainJobStartDateValue: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainJobStartDateValue"',
      },
      MainJobStartDateSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainJobStartDateSavedAt"',
      },
      MainJobStartDateChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"MainJobStartDateChangedAt"',
      },
      MainJobStartDateSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MainJobStartDateSavedBy"',
      },
      MainJobStartDateChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"MainJobStartDateChangedBy"',
      },
      NationalInsuranceNumberValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NationalInsuranceNumberValue"',
      },
      NationalInsuranceNumberSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NationalInsuranceNumberSavedAt"',
      },
      NationalInsuranceNumberChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NationalInsuranceNumberChangedAt"',
      },
      NationalInsuranceNumberSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NationalInsuranceNumberSavedBy"',
      },
      NationalInsuranceNumberChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NationalInsuranceNumberChangedBy"',
      },
      DateOfBirthValue: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DateOfBirthValue"',
      },
      DateOfBirthSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DateOfBirthSavedAt"',
      },
      DateOfBirthChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DateOfBirthChangedAt"',
      },
      DateOfBirthSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DateOfBirthSavedBy"',
      },
      DateOfBirthChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DateOfBirthChangedBy"',
      },
      PostcodeValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PostcodeValue"',
      },
      PostcodeSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"PostcodeSavedAt"',
      },
      PostcodeChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"PostcodeChangedAt"',
      },
      PostcodeSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PostcodeSavedBy"',
      },
      PostcodeChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PostcodeChangedBy"',
      },
      GenderValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Female', 'Male', 'Other', "Don't know"],
        field: '"GenderValue"',
      },
      GenderSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"GenderSavedAt"',
      },
      GenderChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"GenderChangedAt"',
      },
      GenderSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"GenderSavedBy"',
      },
      GenderChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"GenderChangedBy"',
      },
      DisabilityValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', 'Undisclosed', "Don't know"],
        field: '"DisabilityValue"',
      },
      DisabilitySavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DisabilitySavedAt"',
      },
      DisabilityChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DisabilityChangedAt"',
      },
      DisabilitySavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DisabilitySavedBy"',
      },
      DisabilityChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DisabilityChangedBy"',
      },
      EthnicityFkValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"EthnicityFKValue"',
      },
      EthnicityFkSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EthnicityFKSavedAt"',
      },
      EthnicityFkChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EthnicityFKChangedAt"',
      },
      EthnicityFkSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EthnicityFKSavedBy"',
      },
      EthnicityFkChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EthnicityFKChangedBy"',
      },
      EmployedFromOutsideUkValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"EmployedFromOutsideUkValue"',
      },
      EmployedFromOutsideUkSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EmployedFromOutsideUkSavedAt"',
      },
      EmployedFromOutsideUkChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EmployedFromOutsideUkChangedAt"',
      },
      EmployedFromOutsideUkSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EmployedFromOutsideUkSavedBy"',
      },
      EmployedFromOutsideUkChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EmployedFromOutsideUkChangedBy"',
      },
      NationalityValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['British', 'Other', "Don't know"],
        field: '"NationalityValue"',
      },
      NationalityOtherFK: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"NationalityOtherFK"',
      },
      NationalitySavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NationalitySavedAt"',
      },
      NationalityChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NationalityChangedAt"',
      },
      NationalitySavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NationalitySavedBy"',
      },
      NationalityChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NationalityChangedBy"',
      },
      CountryOfBirthValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['United Kingdom', 'Other', "Don't know"],
        field: '"CountryOfBirthValue"',
      },
      CountryOfBirthOtherFK: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"CountryOfBirthOtherFK"',
      },
      CountryOfBirthSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CountryOfBirthSavedAt"',
      },
      CountryOfBirthChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CountryOfBirthChangedAt"',
      },
      CountryOfBirthSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CountryOfBirthSavedBy"',
      },
      CountryOfBirthChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CountryOfBirthChangedBy"',
      },
      RecruitedFromValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: '"RecruitedFromValue"',
      },
      RecruitedFromOtherFK: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"RecruitedFromOtherFK"',
      },
      RecruitedFromSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"RecruitedFromSavedAt"',
      },
      RecruitedFromChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"RecruitedFromChangedAt"',
      },
      RecruitedFromSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"RecruitedFromSavedBy"',
      },
      RecruitedFromChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"RecruitedFromChangedBy"',
      },
      BritishCitizenshipValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"BritishCitizenshipValue"',
      },
      BritishCitizenshipSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"BritishCitizenshipSavedAt"',
      },
      BritishCitizenshipChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"BritishCitizenshipChangedAt"',
      },
      BritishCitizenshipSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"BritishCitizenshipSavedBy"',
      },
      BritishCitizenshipChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"BritishCitizenshipChangedBy"',
      },
      YearArrivedValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: '"YearArrivedValue"',
      },
      YearArrivedYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"YearArrivedYear"',
      },
      YearArrivedSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"YearArrivedSavedAt"',
      },
      YearArrivedChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"YearArrivedChangedAt"',
      },
      YearArrivedSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"YearArrivedSavedBy"',
      },
      YearArrivedChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"YearArrivedChangedBy"',
      },
      SocialCareStartDateValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: '"SocialCareStartDateValue"',
      },
      SocialCareStartDateYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"SocialCareStartDateYear"',
      },
      SocialCareStartDateSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SocialCareStartDateSavedAt"',
      },
      SocialCareStartDateChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SocialCareStartDateChangedAt"',
      },
      SocialCareStartDateSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SocialCareStartDateSavedBy"',
      },
      SocialCareStartDateChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SocialCareStartDateChangedBy"',
      },
      OtherJobsValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"OtherJobsValue"',
      },
      OtherJobsSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OtherJobsSavedAt"',
      },
      OtherJobsChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OtherJobsChangedAt"',
      },
      OtherJobsSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"OtherJobsSavedBy"',
      },
      OtherJobsChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"OtherJobsChangedBy"',
      },
      DaysSickValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: '"DaysSickValue"',
      },
      DaysSickDays: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: '"DaysSickDays"',
      },
      DaysSickSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DaysSickSavedAt"',
      },
      DaysSickChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DaysSickChangedAt"',
      },
      DaysSickSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DaysSickSavedBy"',
      },
      DaysSickChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DaysSickChangedBy"',
      },
      ZeroHoursContractValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"ZeroHoursContractValue"',
      },
      ZeroHoursContractSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ZeroHoursContractSavedAt"',
      },
      ZeroHoursContractChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ZeroHoursContractChangedAt"',
      },
      ZeroHoursContractSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ZeroHoursContractSavedBy"',
      },
      ZeroHoursContractChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ZeroHoursContractChangedBy"',
      },
      WeeklyHoursAverageValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: '"WeeklyHoursAverageValue"',
      },
      WeeklyHoursAverageHours: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: '"WeeklyHoursAverageHours"',
      },
      WeeklyHoursAverageSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"WeeklyHoursAverageSavedAt"',
      },
      WeeklyHoursAverageChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"WeeklyHoursAverageChangedAt"',
      },
      WeeklyHoursAverageSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"WeeklyHoursAverageSavedBy"',
      },
      WeeklyHoursAverageChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"WeeklyHoursAverageChangedBy"',
      },
      WeeklyHoursContractedValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: '"WeeklyHoursContractedValue"',
      },
      WeeklyHoursContractedHours: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: '"WeeklyHoursContractedHours"',
      },
      WeeklyHoursContractedSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"WeeklyHoursContractedSavedAt"',
      },
      WeeklyHoursContractedChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"WeeklyHoursContractedChangedAt"',
      },
      WeeklyHoursContractedSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"WeeklyHoursContractedSavedBy"',
      },
      WeeklyHoursContractedChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"WeeklyHoursContractedChangedBy"',
      },
      AnnualHourlyPayValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Hourly', 'Annually', "Don't know"],
        field: '"AnnualHourlyPayValue"',
      },
      AnnualHourlyPayRate: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: '"AnnualHourlyPayRate"',
      },
      AnnualHourlyPaySavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"AnnualHourlyPaySavedAt"',
      },
      AnnualHourlyPayChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"AnnualHourlyPayChangedAt"',
      },
      AnnualHourlyPaySavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"AnnualHourlyPaySavedBy"',
      },
      AnnualHourlyPayChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"AnnualHourlyPayChangedBy"',
      },
      CareCertificateValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes, completed', 'Yes, in progress or partially completed', 'No'],
        field: '"CareCertificateValue"',
      },
      CareCertificateSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CareCertificateSavedAt"',
      },
      CareCertificateChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CareCertificateChangedAt"',
      },
      CareCertificateSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CareCertificateSavedBy"',
      },
      CareCertificateChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CareCertificateChangedBy"',
      },
      Level2CareCertificateValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes, completed', 'Yes, started', 'No'],
        field: '"Level2CareCertificateValue"',
      },
      Level2CareCertificateYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"Level2CareCertificateYear"',
      },
      Level2CareCertificateSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Level2CareCertificateSavedAt"',
      },
      Level2CareCertificateChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Level2CareCertificateChangedAt"',
      },
      Level2CareCertificateSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Level2CareCertificateSavedBy"',
      },
      Level2CareCertificateChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Level2CareCertificateChangedBy"',
      },
      HealthAndCareVisaValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"HealthAndCareVisaValue"',
      },
      HealthAndCareVisaSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"HealthAndCareVisaSavedAt"',
      },
      HealthAndCareVisaChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"HealthAndCareVisaChangedAt"',
      },
      HealthAndCareVisaSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"HealthAndCareVisaSavedBy"',
      },
      HealthAndCareVisaChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"HealthAndCareVisaChangedBy"',
      },
      ApprenticeshipTrainingValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"ApprenticeshipTrainingValue"',
      },
      ApprenticeshipTrainingSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ApprenticeshipTrainingSavedAt"',
      },
      ApprenticeshipTrainingChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"ApprenticeshipTrainingChangedAt"',
      },
      ApprenticeshipTrainingSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ApprenticeshipTrainingSavedBy"',
      },
      ApprenticeshipTrainingChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"ApprenticeshipTrainingChangedBy"',
      },
      QualificationInSocialCareValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"QualificationInSocialCareValue"',
      },
      QualificationInSocialCareSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"QualificationInSocialCareSavedAt"',
      },
      QualificationInSocialCareChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"QualificationInSocialCareChangedAt"',
      },
      QualificationInSocialCareSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"QualificationInSocialCareSavedBy"',
      },
      QualificationInSocialCareChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"QualificationInSocialCareChangedBy"',
      },
      SocialCareQualificationFkValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"SocialCareQualificationFKValue"',
      },
      SocialCareQualificationFkSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SocialCareQualificationFKSavedAt"',
      },
      SocialCareQualificationFkChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SocialCareQualificationFKChangedAt"',
      },
      SocialCareQualificationFkSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SocialCareQualificationFKSavedBy"',
      },
      SocialCareQualificationFkChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SocialCareQualificationFKChangedBy"',
      },
      OtherQualificationsValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"OtherQualificationsValue"',
      },
      OtherQualificationsSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OtherQualificationsSavedAt"',
      },
      OtherQualificationsChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"OtherQualificationsChangedAt"',
      },
      OtherQualificationsSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"OtherQualificationsSavedBy"',
      },
      OtherQualificationsChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"OtherQualificationsChangedBy"',
      },
      HighestQualificationFkValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"HighestQualificationFKValue"',
      },
      HighestQualificationFkSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"HighestQualificationFKSavedAt"',
      },
      HighestQualificationFkChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"HighestQualificationFKChangedAt"',
      },
      HighestQualificationFkSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"HighestQualificationFKSavedBy"',
      },
      HighestQualificationFkChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"HighestQualificationFKChangedBy"',
      },
      CompletedValue: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"CompletedValue"',
      },
      CompletedSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CompletedSavedAt"',
      },
      CompletedChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CompletedChangedAt"',
      },
      CompletedSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CompletedSavedBy"',
      },
      CompletedChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CompletedChangedBy"',
      },
      NurseSpecialismFKValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"NurseSpecialismFKValue"',
      },
      NurseSpecialismFKOther: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NurseSpecialismFKOther"',
      },
      NurseSpecialismFKSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NurseSpecialismFKSavedAt"',
      },
      NurseSpecialismFKChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NurseSpecialismFKChangedAt"',
      },
      NurseSpecialismFKSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NurseSpecialismFKSavedBy"',
      },
      NurseSpecialismFKChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NurseSpecialismFKChangedBy"',
      },
      NurseSpecialismsValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No', "Don't know"],
        field: '"NurseSpecialismsValue"',
      },
      NurseSpecialismsSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NurseSpecialismsSavedAt"',
      },
      NurseSpecialismsChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"NurseSpecialismsChangedAt"',
      },
      NurseSpecialismsSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NurseSpecialismsSavedBy"',
      },
      NurseSpecialismsChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NurseSpecialismsChangedBy"',
      },
      RegisteredNurseValue: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Adult nurse', 'Mental health nurse', 'Learning disabiliies', "Children's nurse", 'Enrolled nurse'],
        field: '"RegisteredNurseValue"',
      },
      RegisteredNurseSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"RegisteredNurseSavedAt"',
      },
      RegisteredNurseChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"RegisteredNurseChangedAt"',
      },
      RegisteredNurseSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"RegisteredNurseSavedBy"',
      },
      RegisteredNurseChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"RegisteredNurseChangedBy"',
      },
      CareWorkforcePathwayRoleCategoryFK: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"CareWorkforcePathwayRoleCategoryFK"',
      },
      CareWorkforcePathwayRoleCategorySavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CareWorkforcePathwayRoleCategorySavedAt"',
      },
      CareWorkforcePathwayRoleCategoryChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CareWorkforcePathwayRoleCategoryChangedAt"',
      },
      CareWorkforcePathwayRoleCategorySavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CareWorkforcePathwayRoleCategorySavedBy"',
      },
      CareWorkforcePathwayRoleCategoryChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CareWorkforcePathwayRoleCategoryChangedBy"',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created',
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated',
      },
      updatedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'updatedby',
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'Archived',
      },
      reasonFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'LeaveReasonFK',
      },
      otherReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'LeaveReasonOther',
      },
      MainJobFkOther: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'MainJobFkOther',
      },
      LongTermAbsence: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'],
        field: '"LongTermAbsence"',
      },
      source: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Online', 'Bulk'],
        default: 'Online',
        field: '"DataSource"',
      },
    },
    {
      scopes: {
        active: {
          where: {
            archived: false,
          },
        },
        noLocalIdentifier: {
          where: {
            LocalIdentifierValue: {
              [Op.is]: null,
            },
          },
        },
      },
      tableName: '"Worker"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false, // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
    },
  );

  Worker.associate = (models) => {
    Worker.belongsTo(models.establishment, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'establishment',
    });
    Worker.belongsTo(models.job, {
      foreignKey: 'MainJobFkValue',
      targetKey: 'id',
      as: 'mainJob',
    });
    Worker.hasMany(models.workerAudit, {
      foreignKey: 'workerFk',
      sourceKey: 'id',
      as: 'auditEvents',
      onDelete: 'CASCADE',
    });
    Worker.hasMany(models.workerTraining, {
      foreignKey: 'workerFk',
      sourceKey: 'id',
      as: 'workerTraining',
      onDelete: 'CASCADE',
    });
    Worker.belongsTo(models.ethnicity, {
      foreignKey: 'EthnicityFkValue',
      targetKey: 'id',
      as: 'ethnicity',
    });
    Worker.belongsTo(models.workerNurseSpecialism, {
      foreignKey: 'NurseSpecialismFKValue',
      targetKey: 'id',
      as: 'nurseSpecialism',
    });
    Worker.belongsTo(models.nationality, {
      foreignKey: 'NationalityOtherFK',
      targetKey: 'id',
      as: 'nationality',
    });
    Worker.belongsTo(models.qualification, {
      foreignKey: 'SocialCareQualificationFkValue',
      targetKey: 'id',
      as: 'socialCareQualification',
    });
    Worker.belongsTo(models.qualification, {
      foreignKey: 'HighestQualificationFkValue',
      targetKey: 'id',
      as: 'highestQualification',
    });
    Worker.belongsTo(models.country, {
      foreignKey: 'CountryOfBirthOtherFK',
      targetKey: 'id',
      as: 'countryOfBirth',
    });
    Worker.belongsTo(models.recruitedFrom, {
      foreignKey: 'RecruitedFromOtherFK',
      targetKey: 'id',
      as: 'recruitedFrom',
    });
    Worker.belongsTo(models.careWorkforcePathwayRoleCategory, {
      foreignKey: 'CareWorkforcePathwayRoleCategoryFK',
      targetKey: 'id',
      as: 'careWorkforcePathwayRoleCategory',
    });
    Worker.belongsToMany(models.job, {
      through: 'workerJobs',
      foreignKey: 'workerFk',
      otherKey: 'jobFk',
      as: 'otherJobs',
    });
    Worker.belongsToMany(models.workerNurseSpecialism, {
      through: 'workerNurseSpecialisms',
      foreignKey: 'workerFk',
      otherKey: 'nurseSpecialismFk',
      as: 'nurseSpecialisms',
    });
    Worker.belongsToMany(models.workerQualifications, {
      foreignKey: 'workerFk',
      through: 'workerQualifications',
      otherKey: 'ID',
      as: 'qualifications',
    });
    Worker.hasMany(models.trainingCertificates, {
      foreignKey: 'workerFk',
      sourceKey: 'id',
      as: 'trainingCertificates',
      onDelete: 'CASCADE',
    });
  };
  Worker.permAndTempCountForEstablishment = function (establishmentId) {
    return this.count({
      where: {
        archived: false,
        ContractValue: ['Permanent', 'Temporary'],
        establishmentFk: establishmentId,
      },
    });
  };
  Worker.countForEstablishment = async function (establishmentId) {
    return await this.count({
      where: {
        establishmentFk: establishmentId,
        archived: false,
      },
    });
  };
  Worker.specificJobs = function (establishmentId, jobArray) {
    return this.findAll({
      attributes: ['id', 'uid', 'SocialCareQualificationFkValue'],
      where: {
        establishmentFk: establishmentId,
        MainJobFkValue: jobArray,
        archived: false,
        QualificationInSocialCareValue: 'No',
      },
    });
  };
  Worker.countSocialCareQualificationsAndNoQualifications = async function (establishmentId, jobArray) {
    return this.findOne({
      attributes: [
        [
          sequelize.cast(
            sequelize.fn(
              'SUM',
              sequelize.literal(
                'CASE WHEN "QualificationInSocialCareValue" = \'Yes\' AND "SocialCareQualificationFKValue" NOT IN (10) THEN 1 ELSE 0 END',
              ),
            ),
            'int',
          ),
          'quals',
        ],
        [
          sequelize.cast(
            sequelize.fn(
              'SUM',
              sequelize.literal('CASE WHEN "QualificationInSocialCareValue" = \'No\' THEN 1 ELSE 0 END'),
            ),
            'int',
          ),
          'noQuals',
        ],
        [
          sequelize.cast(
            sequelize.fn(
              'SUM',
              sequelize.literal(
                'CASE WHEN "QualificationInSocialCareValue" = \'Yes\' AND "SocialCareQualificationFKValue" NOT IN (10) AND "SocialCareQualificationFKValue" > 2 THEN 1 ELSE 0 END',
              ),
            ),
            'int',
          ),
          'lvl2Quals',
        ],
      ],
      where: {
        establishmentFk: establishmentId,
        MainJobFkValue: jobArray,
        archived: false,
      },
      raw: true,
    });
  };

  Worker.averageHourlyPay = async function (params) {
    const establishmentId = params.establishmentId;
    const mainJobFk = params.mainJob || 10;
    const annualOrHourly = params.annualOrHourly || 'Hourly';

    return this.findOne({
      attributes: [[sequelize.fn('avg', sequelize.col('AnnualHourlyPayRate')), 'amount']],
      where: {
        MainJobFkValue: mainJobFk,
        archived: false,
        AnnualHourlyPayValue: annualOrHourly,
        AnnualHourlyPayRate: {
          [Op.not]: null,
        },
        establishmentFk: establishmentId,
      },
      raw: true,
    });
  };

  Worker.yearOrMoreInRoleCount = async function (establishmentId) {
    const yearAgo = dayjs(new Date()).subtract(1, 'year').toDate();
    return this.count({
      where: {
        establishmentFk: establishmentId,
        archived: false,
        ContractValue: ['Permanent', 'Temporary'],
        MainJobStartDateValue: {
          [Op.lt]: yearAgo,
        },
      },
    });
  };

  Worker.countForPermAndTempNoStartDate = async function (establishmentId) {
    return this.count({
      where: {
        establishmentFk: establishmentId,
        archived: false,
        ContractValue: ['Permanent', 'Temporary'],
        MainJobStartDateValue: null,
      },
    });
  };

  Worker.getEstablishmentTrainingRecords = async function (establishmentId) {
    return this.findAll({
      attributes: [
        'NameOrIdValue',
        'LongTermAbsence',
        [
          sequelize.literal(
            `
              (
                SELECT json_agg(cqc."TrainingCategories"."Category")
                  FROM cqc."MandatoryTraining"
                  RIGHT JOIN cqc."TrainingCategories" ON
                  "TrainingCategoryFK" = cqc."TrainingCategories"."ID"
                  WHERE "EstablishmentFK" = "worker"."EstablishmentFK"
                  AND "JobFK" = "worker"."MainJobFKValue"
              )
            `,
          ),
          'mandatoryTrainingCategories',
        ],
      ],
      where: {
        establishmentFk: establishmentId,
        archived: false,
      },
      include: [
        {
          model: sequelize.models.job,
          as: 'mainJob',
          attributes: ['title'],
        },
        {
          model: sequelize.models.workerTraining,
          as: 'workerTraining',
          attributes: ['CategoryFK', 'Title', 'Expires', 'Completed', 'Accredited'],
          include: [
            {
              model: sequelize.models.workerTrainingCategories,
              as: 'category',
              attributes: ['category'],
            },
          ],
        },
      ],
    });
  };

  Worker.getAllWorkersNationalityAndBritishCitizenship = async function (establishmentId) {
    return await this.findAll({
      attributes: [
        'id',
        'uid',
        'NameOrIdValue',
        'NationalityValue',
        'BritishCitizenshipValue',
        'HealthAndCareVisaValue',
        'EmployedFromOutsideUkValue',
      ],
      where: {
        establishmentFk: establishmentId,
        archived: false,
        HealthAndCareVisaValue: null,
      },
      order: [['NameOrIdValue', 'ASC']],
    });
  };

  Worker.findOneWithConflictingLocalRef = async function (establishmentIds, localIdentifierValue) {
    /** Check if there is a worker having the same localIdentifierValue when whitespaces are not considered.
     *
     * As the legacy code does a /\s/g replacement in several different places,
     * this helps to ensure uniqueness and prevent unexpected reference collision.
     */
    return await this.findOne({
      attributes: ['id', 'NameOrIdValue', 'LocalIdentifierValue'],
      where: {
        [Op.and]: [
          { establishmentFk: establishmentIds },
          sequelize.where(sequelize.fn('REPLACE', sequelize.col('LocalIdentifierValue'), ' ', ''), {
            [Op.eq]: localIdentifierValue.replace(/\s/g, ''),
          }),
        ],
      },
    });
  };

  Worker.countAllWorkersWithoutCareWorkforceCategory = async function (establishmentId) {
    return await this.count({
      where: {
        establishmentFk: establishmentId,
        archived: false,
        CareWorkforcePathwayRoleCategoryFK: null,
      },
    });
  };

  Worker.getAndCountAllWorkersWithoutCareWorkforceCategory = async function ({
    establishmentId,
    itemsPerPage,
    pageIndex,
  }) {
    const { count, rows } = await this.findAndCountAll({
      attributes: ['uid', 'NameOrIdValue'],
      where: {
        establishmentFk: establishmentId,
        archived: false,
        CareWorkforcePathwayRoleCategoryFK: null,
      },
      include: [
        {
          model: sequelize.models.job,
          as: 'mainJob',
          attributes: ['title'],
        },
      ],
      order: [['NameOrIdValue', 'ASC']],
      offset: itemsPerPage * pageIndex,
      limit: itemsPerPage,
    });

    const workers = rows.map((worker) => {
      const { uid, mainJob, NameOrIdValue: nameOrId } = worker;
      return { uid, mainJob, nameOrId };
    });

    return { count, workers };
  };

  return Worker;
};
