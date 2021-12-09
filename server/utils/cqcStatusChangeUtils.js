module.exports.convertIndividualCqcStatusChange = (cqcStatusChange) => {
  const individualApproval = {
    status: cqcStatusChange.Status,
    requestUid: cqcStatusChange.UUID,
    username: cqcStatusChange.User.FullNameValue,
    establishment: {
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

  const notes = convertNotes(cqcStatusChange.Establishment.notes);

  return {
    ...individualApproval,
    notes,
  };
};

const convertNotes = (notes) => {
  return notes.map((noteObj) => {
    return {
      note: noteObj.note,
      createdAt: noteObj.createdAt,
      user: noteObj.user.FullNameValue,
    };
  });
};
