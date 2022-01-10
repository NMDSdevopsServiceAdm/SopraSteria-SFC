class BUDI {
  constructor(mappings) {
    this.JOB_ROLES_MAPPINGS = mappings.JOB_ROLES_MAPPINGS;
    this.CONTRACT_TYPE_MAPPINGS = mappings.CONTRACT_TYPE_MAPPINGS;
    this.ETHNICITY_MAPPINGS = mappings.ETHNICITY_MAPPINGS;
    this.NATIONALITY_MAPPINGS = mappings.NATIONALITY_MAPPINGS;
    this.COUNTRY_MAPPINGS = mappings.COUNTRY_MAPPINGS;
    this.RECRUITMENT_MAPPINGS = mappings.RECRUITMENT_MAPPINGS;
    this.NURSING_SPECIALIST_MAPPINGS = mappings.NURSING_SPECIALIST_MAPPINGS;
    this.QUALIFICATION_LEVELS_MAPPINGS = mappings.QUALIFICATION_LEVELS_MAPPINGS;
    this.QUALIFICATIONS_MAPPINGS = mappings.QUALIFICATIONS_MAPPINGS;
  }

  get TO_ASC() {
    return 'BUDI';
  }
  get FROM_ASC() {
    return 'ASC';
  }

  mapFrom(originalType) {
    return originalType === 'ASC' ? 'BUDI' : 'ASC';
  }

  convertValue(originalType, originalCode, fixedMapping) {
    const found = fixedMapping.find((thisJob) => thisJob[originalType] === originalCode);
    return found ? found[this.mapFrom(originalType)] : null;
  }

  jobRoles(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.JOB_ROLES_MAPPINGS);
  }

  contractType(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.CONTRACT_TYPE_MAPPINGS);
  }

  ethnicity(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.ETHNICITY_MAPPINGS);
  }

  nationality(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.NATIONALITY_MAPPINGS);
  }

  country(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.COUNTRY_MAPPINGS);
  }

  recruitment(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.RECRUITMENT_MAPPINGS);
  }

  nursingSpecialist(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.NURSING_SPECIALIST_MAPPINGS);
  }

  mapNurseSpecialismsToDb(specialisms) {
    if (specialisms.length === 1 && specialisms[0] === 7) {
      return { value: 'No' };
    } else if (specialisms.length === 1 && specialisms[0] === 8) {
      return { value: "Don't know" };
    } else {
      return {
        value: 'Yes',
        specialisms: specialisms.filter((s) => s !== 7 && s !== 8).map((s) => ({ id: s })),
      };
    }
  }

  qualificationLevels(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.QUALIFICATION_LEVELS_MAPPINGS);
  }

  qualifications(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.QUALIFICATIONS_MAPPINGS);
  }
}

exports.BUDI = BUDI;
