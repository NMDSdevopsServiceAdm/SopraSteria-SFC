let JOB_ROLES_MAPPINGS = null;
let CONTRACT_TYPE_MAPPINGS = null;
let ETHNICITY_MAPPINGS = null;
let NATIONALITY_MAPPINGS = null;
let COUNTRY_MAPPINGS = null;
let RECRUITMENT_MAPPINGS = null;
let NURSING_SPECIALIST_MAPPINGS = null;
let QUALIFICATION_LEVELS_MAPPINGS = null;
let QUALIFICATIONS_MAPPINGS = null;

class BUDI {
  static async initialize(mappings) {
    JOB_ROLES_MAPPINGS = mappings.JOB_ROLES_MAPPINGS;
    CONTRACT_TYPE_MAPPINGS = mappings.CONTRACT_TYPE_MAPPINGS;
    ETHNICITY_MAPPINGS = mappings.ETHNICITY_MAPPINGS;
    NATIONALITY_MAPPINGS = mappings.NATIONALITY_MAPPINGS;
    COUNTRY_MAPPINGS = mappings.COUNTRY_MAPPINGS;
    RECRUITMENT_MAPPINGS = mappings.RECRUITMENT_MAPPINGS;
    NURSING_SPECIALIST_MAPPINGS = mappings.NURSING_SPECIALIST_MAPPINGS;
    QUALIFICATION_LEVELS_MAPPINGS = mappings.QUALIFICATION_LEVELS_MAPPINGS;
    QUALIFICATIONS_MAPPINGS = mappings.QUALIFICATIONS_MAPPINGS;
  }

  static get TO_ASC() {
    return 'BUDI';
  }
  static get FROM_ASC() {
    return 'ASC';
  }

  static mapFrom(originalType) {
    return originalType === 'ASC' ? 'BUDI' : 'ASC';
  }

  static convertValue(originalType, originalCode, fixedMapping) {
    const found = fixedMapping.find((thisJob) => thisJob[originalType] === originalCode);
    return found ? found[this.mapFrom(originalType)] : null;
  }

  static jobRoles(direction, originalCode) {
    return this.convertValue(direction, originalCode, JOB_ROLES_MAPPINGS);
  }

  static contractType(direction, originalCode) {
    return this.convertValue(direction, originalCode, CONTRACT_TYPE_MAPPINGS);
  }

  static ethnicity(direction, originalCode) {
    return this.convertValue(direction, originalCode, ETHNICITY_MAPPINGS);
  }

  static nationality(direction, originalCode) {
    return this.convertValue(direction, originalCode, NATIONALITY_MAPPINGS);
  }

  static country(direction, originalCode) {
    return this.convertValue(direction, originalCode, COUNTRY_MAPPINGS);
  }

  static recruitment(direction, originalCode) {
    return this.convertValue(direction, originalCode, RECRUITMENT_MAPPINGS);
  }

  static nursingSpecialist(direction, originalCode) {
    return this.convertValue(direction, originalCode, NURSING_SPECIALIST_MAPPINGS);
  }

  static mapNurseSpecialismsToDb(specialisms) {
    if (specialisms.length === 1 && specialisms[0] === 7) {
      return { value: 'No' };
    } else if (specialisms.length === 1 && specialisms[0] === 8) {
      return { value: `Don't know` };
    } else {
      return {
        value: 'Yes',
        specialisms: specialisms.filter((s) => s !== 7 && s !== 8).map((s) => ({ id: s })),
      };
    }
  }

  static qualificationLevels(direction, originalCode) {
    return this.convertValue(direction, originalCode, QUALIFICATION_LEVELS_MAPPINGS);
  }

  static qualifications(direction, originalCode) {
    return this.convertValue(direction, originalCode, QUALIFICATIONS_MAPPINGS);
  }
}

exports.BUDI = BUDI;
