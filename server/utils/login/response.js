// TODO: enforce JSON schema
module.exports = (
  uid,
  fullname,
  isPrimary,
  lastLoggedDate,
  role,
  establishment,
  username,
  expiryDate,
  agreedUpdatedTerms,
  migratedUser,
) => {
  // note - the mainService can be null
  return {
    username,
    uid,
    fullname,
    isPrimary,
    lastLoggedIn: lastLoggedDate ? lastLoggedDate.toISOString() : null,
    role,
    agreedUpdatedTerms,
    migratedUserFirstLogon: migratedUser ? migratedUser.migratedUserFirstLogon : undefined,
    migratedUser: migratedUser ? migratedUser.migratedUser : undefined,
    establishment: establishment
      ? {
          id: establishment.id,
          uid: establishment.uid,
          name: establishment.NameValue,
          isRegulated: establishment.isRegulated,
          nmdsId: establishment.nmdsId,
          isParent: establishment.isParent,
          parentUid: establishment.parentUid ? establishment.parentUid : undefined,
          parentName: establishment.parentName ? establishment.parentName : undefined,
          isFirstBulkUpload: establishment.lastBulkUploaded ? false : true,
        }
      : null,
    mainService: establishment
      ? {
          id: establishment.mainService ? establishment.mainService.id : null,
          name: establishment.mainService ? establishment.mainService.name : null,
        }
      : null,
    expiryDate: expiryDate,
  };
};
