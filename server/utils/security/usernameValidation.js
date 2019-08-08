
exports.isUsernameValid = (username) => {
  const regex = /^[A-Za-z0-9_-]*$/;
  return regex.test(username);
};
