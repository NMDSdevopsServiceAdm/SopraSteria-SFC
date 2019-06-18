
exports.isUsernameValid = (username) => {
  const regex = /^[a-z0-9]*$/;
  return regex.test(username);
};
