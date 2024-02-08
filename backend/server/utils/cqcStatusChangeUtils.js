module.exports.convertIndividualCqcStatusChange = (cqcStatusChange) => {
  return {
    status: cqcStatusChange.Status,
    requestUid: cqcStatusChange.UUID,
    requestId: cqcStatusChange.ID,
    createdAt: cqcStatusChange.createdAt,
    username: cqcStatusChange.User.FullNameValue,
    userId: cqcStatusChange.User.RegistrationID,
    establishment: {
      status: cqcStatusChange.Status,
      inReview: cqcStatusChange.InReview,
      reviewer: cqcStatusChange.Reviewer,
      establishmentId: cqcStatusChange.Establishment.id,
      establishmentUid: cqcStatusChange.Establishment.uid,
      workplaceId: cqcStatusChange.Establishment.nmdsId,
      name: cqcStatusChange.Establishment.NameValue,
      address1: cqcStatusChange.Establishment.address1,
      address2: cqcStatusChange.Establishment.address2,
      address3: cqcStatusChange.Establishment.address3,
      town: cqcStatusChange.Establishment.town,
      county: cqcStatusChange.Establishment.county,
      postcode: cqcStatusChange.Establishment.postcode,
    },
    data: {
      currentService: {
        id: cqcStatusChange.Data.currentService.id,
        name: cqcStatusChange.Data.currentService.name,
        other: cqcStatusChange.Data.currentService.other || null,
      },
      requestedService: {
        id: cqcStatusChange.Data.requestedService.id,
        name: cqcStatusChange.Data.requestedService.name,
        other: cqcStatusChange.Data.requestedService.other || null,
      },
    },
  };
};
