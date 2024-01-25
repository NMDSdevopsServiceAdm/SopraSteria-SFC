module.exports.convertIndividualParentRequest = (ParentRequest) => {
  return {
    status: ParentRequest.Status,
    requestUid: ParentRequest.UUID,
    requestId: ParentRequest.ID,
    createdAt: ParentRequest.createdAt,
    username: ParentRequest.User.FullNameValue,
    userId: ParentRequest.User.RegistrationID,
    establishment: {
      status: ParentRequest.Status,
      inReview: ParentRequest.InReview,
      reviewer: ParentRequest.Reviewer,
      establishmentId: ParentRequest.Establishment.id,
      establishmentUid: ParentRequest.Establishment.uid,
      workplaceId: ParentRequest.Establishment.nmdsId,
      name: ParentRequest.Establishment.NameValue,
      address1: ParentRequest.Establishment.address1,
      address2: ParentRequest.Establishment.address2,
      address3: ParentRequest.Establishment.address3,
      town: ParentRequest.Establishment.town,
      county: ParentRequest.Establishment.county,
      postcode: ParentRequest.Establishment.postcode,
    },
  };
};
