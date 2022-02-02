exports.dateFormatter = (dateOfBirth) => {
  const dobParts = dateOfBirth ? dateOfBirth.split('-') : null;
  return dobParts ? `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}` : '';
};
