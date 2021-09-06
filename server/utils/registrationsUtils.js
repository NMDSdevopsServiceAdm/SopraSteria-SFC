module.exports.convertWorkplaceToCorrectFormat = (rawWorkplace) => {
  const workplace = rawWorkplace.toJSON();

  return {
    created: workplace.created,
    username: workplace.updatedBy,
    establishment: {
      id: workplace.EstablishmentID,
      name: workplace.NameValue,
      isRegulated: workplace.IsRegulated,
      nmdsId: workplace.NmdsID,
      address: workplace.Address1,
      address2: workplace.Address2,
      address3: workplace.Address3,
      postcode: workplace.PostCode,
      town: workplace.Town,
      county: workplace.County,
      locationId: workplace.LocationID,
      provid: workplace.ProvID,
      mainService: workplace.mainService.name,
      parentId: workplace.ParentID,
      status: workplace.Status,
      uid: workplace.EstablishmentUID,
    }
  };
};

module.exports.convertLoginToCorrectFormat = (rawLogin) => {
  const convertedLogin = rawLogin.toJSON();

  return {
    name: convertedLogin.FullNameValue,
    username: convertedLogin.login.username,
    securityQuestion: convertedLogin.SecurityQuestionValue,
    securityQuestionAnswer: convertedLogin.SecurityQuestionAnswerValue,
    email: convertedLogin.EmailValue,
    phone: convertedLogin.PhoneValue,
    created: convertedLogin.created,
  };
}
