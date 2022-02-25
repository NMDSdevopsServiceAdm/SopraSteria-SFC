const { RegistrationException } = require('./responseErrors');
const User = require('../../models/classes/user').User;

const saveUserToDatabase = async (userData, newUser, transaction) => {
  await newUser.load(userData);

  if (!newUser.isValid()) {
    throw new RegistrationException('User data is invalid');
  }

  await newUser.save(userData.username, 0, transaction);

  return {
    uid: newUser.uid,
    status: newUser.status,
  };
};

const createUser = async (reqUser, establishmentId, transaction) => {
  const userData = {
    ...reqUser,
    canManageWdfClaims: reqUser.canManageWdfClaims || false,
    isActive: false,
    status: 'PENDING',
    role: 'Edit',
    isPrimary: true,
    registrationSurveyCompleted: false,
    email: reqUser.email.toLowerCase(),
    username: reqUser.username.toLowerCase(),
  };

  const newUser = new User(establishmentId);

  return await saveUserToDatabase(userData, newUser, transaction);
};

module.exports = {
  saveUserToDatabase,
  createUser,
};
