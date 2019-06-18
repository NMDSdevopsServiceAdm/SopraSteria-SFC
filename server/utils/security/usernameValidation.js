
exports.isUsernameValid = (username) => {
  const regex = /[a-z0-9_-]$/i;
  return regex.test(username);
};
