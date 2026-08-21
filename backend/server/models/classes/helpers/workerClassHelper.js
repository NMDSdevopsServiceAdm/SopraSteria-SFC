const removePersonalInformationOfWorker = Object.freeze({
  NameOrIdValue: '', // use empty string as column is non-nullable
  NationalInsuranceNumberValue: null,
  DateOfBirthValue: null,
  PostcodeValue: null,
  DisabilityValue: null,
  GenderValue: null,
  EthnicityFkValue: null,
  EthnicityFKValue: null,
  NationalityValue: null,
  NationalityOtherFK: null,
  CountryOfBirthValue: null,
  CountryOfBirthOtherFK: null,
  RecruitedFromValue: null,
  RecruitedFromOtherFK: null,
  BritishCitizenshipValue: null,
  YearArrivedValue: null,
  YearArrivedYear: null,
  DateOfBirthEncryptedValue: null,
  NationalInsuranceNumberEncryptedValue: null,
  HealthAndCareVisaValue: null,
});

module.exports = { removePersonalInformationOfWorker };
