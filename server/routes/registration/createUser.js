const { responseErrors, RegistrationException } = require('./responseErrors');

exports.saveUserToDatabase = async (userData, newUser, transaction) => {
  await newUser.load(userData);

  if (!newUser.isValid()) {
    throw new RegistrationException(
      'Invalid user/login properties',
      responseErrors.invalidUser.errCode,
      responseErrors.invalidUser.errMessage,
    );
  }

  await newUser.save(userData.username, 0, transaction);
};
