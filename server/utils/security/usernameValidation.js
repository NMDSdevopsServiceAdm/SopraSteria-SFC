
exports.isUsernameValid = (username) => {
  const regex = /^[a-z0-9_-]*$/;
  return regex.test(username);
};
