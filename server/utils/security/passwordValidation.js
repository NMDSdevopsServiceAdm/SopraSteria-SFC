exports.isPasswordValid = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,50}$/;

  return passwordRegex.test(password);
};
