const responseErrors = {
  unexpectedMainService: 'Unexpected main service',
  unexpectedProblem: 'Unexpected problem with registration',
  invalidEstablishment: 'Establishment data is invalid',
  invalidUser: 'User data is invalid',
  invalidUsername: 'Invalid Username',
  invalidPassword:
    'Password must be at least 8 characters long and have uppercase letters, lowercase letters and numbers',
  emptyRequest: 'Parameters missing',
};

class RegistrationException {
  constructor(message) {
    this.message = message;
  }
}

module.exports = {
  RegistrationException,
  responseErrors,
};
