const responseErrors = {
  default: {
    errCode: -1,
    errMessage: 'Registration Error',
  },
  eastablishment: {
    errCode: -2,
    errMessage: 'Registration: Failed to create Establishment',
  },
  user: {
    errCode: -3,
    errMessage: 'Registration: Failed to create User',
  },
  login: {
    errCode: -4,
    errMessage: 'Registration: Failed to create Login',
  },
  duplicateNonCQC: {
    errCode: -100,
    errMessage: 'Duplicate non-CQC Establishment',
    db_constraint: 'Establishment_unique_registration',
  },
  duplicateCQC: {
    errCode: -150,
    errMessage: 'Duplicate CQC Establishment',
    db_constraint: 'Establishment_unique_registration_with_locationid',
  },
  duplicateEstablishment: {
    errCode: -190,
    errMessage: 'Duplicate Establishment',
  },
  duplicateUsername: {
    errCode: -200,
    errMessage: 'Duplicate Username',
    db_constraint: 'uc_Login_Username',
  },
  unexpectedMainService: {
    errCode: -300,
    errMessage: 'Unexpected main service',
  },
  unknownLocation: {
    errCode: -400,
    errMessage: 'Unknown location',
    db_constraint: 'uc_Login_Username',
  },
  unknownNMDSsequence: {
    errCode: -500,
    errMessage: 'Unknown NMDS Sequence',
  },
  unknownNMDSLetter: {
    errCode: -600,
    errMessage: 'Unknown NMDS Letter/CSSR Region',
  },
  invalidEstablishment: {
    errCode: -700,
    errMessage: 'Establishment data is invalid',
  },
  invalidUser: {
    errCode: -800,
    errMessage: 'User data is invalid',
  },
  invalidUsername: {
    errCode: -210,
    errMessage: 'Invalid Username',
  },
  invalidPassword: {
    errCode: -220,
    errMessage: 'Password must be at least 8 characters long and have uppercase letters, lowercase letters and numbers',
  },
  emptyRequest: {
    errCode: -230,
    errMessage: 'Parameters missing',
  },
};

class RegistrationException {
  constructor(originalError, errCode, errMessage) {
    this.err = originalError;
    this.errCode = errCode;
    this.errMessage = errMessage;
  }

  toString() {
    return `${this.errCode}: ${this.errMessage}`;
  }
}

module.exports = {
  RegistrationException,
  responseErrors,
};
