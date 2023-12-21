const EstablishmentTransformer = async (establishments) => {
  return establishments.map((establishment) => {
    const parent = establishment.Parent ? { uid: establishment.Parent.uid, nmdsId: establishment.Parent.nmdsId } : {};

    const users = establishment.users
      ? establishment.users.map((user) => {
          return {
            uid: user.uid,
            name: user.FullNameValue,
            username: user.login ? user.login.username : '',
            securityQuestion: user.SecurityQuestionValue,
            securityAnswer: user.SecurityQuestionAnswerValue,
            isLocked: user.login && !user.login.isActive,
          };
        })
      : [];

    const subsidiaries = establishment.Subsidiaries
      ? establishment.Subsidiaries.map((sub) => {
          return { name: sub.NameValue };
        })
      : [];

    return {
      uid: establishment.uid,
      name: establishment.NameValue,
      nmdsId: establishment.nmdsId,
      postcode: establishment.postcode,
      isRegulated: establishment.isRegulated,
      address1: establishment.address1,
      address2: establishment.address2,
      town: establishment.town,
      county: establishment.county,
      isParent: establishment.isParent,
      dataOwner: establishment.dataOwner,
      locationId: establishment.locationId,
      lastUpdated: establishment.updated,
      providerId: establishment.provId,
      notes: establishment.notes,
      employerType: {
        value: establishment.EmployerTypeValue,
        other: establishment.EmployerTypeOther,
      },
      parent,
      users,
      subsidiaries,
    };
  });
};

const UserTransformer = async (users) => {
  return users.map((user) => {
    const parent = user.establishment.ParentID
      ? {
          nmdsId: user.establishment.Parent.nmdsId,
          name: user.establishment.Parent.NameValue,
          postcode: user.establishment.Parent.postcode,
        }
      : null;

    return {
      uid: user.uid,
      name: user.FullNameValue,
      username: user.login ? user.login.username : '',
      isPrimary: user.isPrimary,
      securityQuestion: user.SecurityQuestionValue,
      securityQuestionAnswer: user.SecurityQuestionAnswerValue,
      email: user.EmailValue,
      phone: user.PhoneValue,
      isLocked: user.login ? !user.login.isActive : '',
      invalidAttempt: user.login ? user.login.invalidAttempt : '',
      passwdLastChanged: user.login ? user.login.passwdLastChanged : '',
      lastLoggedIn: user.login ? user.login.lastLogin : '',
      establishment: {
        uid: user.establishment.uid,
        name: user.establishment.NameValue,
        nmdsId: user.establishment.nmdsId,
        postcode: user.establishment.postcode,
        isRegulated: user.establishment.isRegulated,
        address: user.establishment.address1,
        isParent: user.establishment.isParent,
        parent,
        locationId: user.establishment.locationId,
        ustatus: user.establishment.ustatus,
      },
    };
  });
};

module.exports.EstablishmentTransformer = EstablishmentTransformer;
module.exports.UserTransformer = UserTransformer;
