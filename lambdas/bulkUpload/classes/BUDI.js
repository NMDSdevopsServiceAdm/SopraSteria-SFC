class BUDI {
  constructor(mappings) {
    this.mappings = mappings;
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
    return this.convertValue(direction, originalCode, this.mappings.JOB_ROLES);
  }

  contractType(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.CONTRACT_TYPE);
  }

  ethnicity(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.ETHNICITY);
  }

  nationality(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.NATIONALITY);
  }

  country(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.COUNTRY);
  }

  recruitment(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.RECRUITMENT);
  }

  nursingSpecialist(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.NURSING_SPECIALIST);
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
    return this.convertValue(direction, originalCode, this.mappings.QUALIFICATION_LEVELS);
  }

  qualifications(direction, originalCode) {
    return this.convertValue(direction, originalCode, this.mappings.QUALIFICATIONS);
  }
}

exports.BUDI = BUDI;
