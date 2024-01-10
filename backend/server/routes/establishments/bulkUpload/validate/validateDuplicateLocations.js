'use strict';

const validateDuplicateLocations = async (myEstablishments, csvEstablishmentSchemaErrors, myCurrentEstablishments) => {
  const locations = [];
  const checkDuplicate = (thisEstablishment, locationId) => {
    if (locations[locationId] !== undefined) {
      csvEstablishmentSchemaErrors.push(thisEstablishment.getDuplicateLocationError());
      return;
    }

    locations[locationId] = thisEstablishment.lineNumber;
  };

  const filterByStatus = (thisEstablishment, statuses) => {
    return statuses.includes(thisEstablishment._currentLine.STATUS);
  };

  myEstablishments
    .filter((thisEstablishment) => filterByStatus(thisEstablishment, ['NOCHANGE']))
    .forEach((thisEstablishment) => {
      myCurrentEstablishments
        .filter(
          (establishment) =>
            establishment.localIdentifier &&
            establishment.localIdentifier === thisEstablishment._currentLine.LOCALESTID,
        )
        .forEach((establishment) => {
          return checkDuplicate(thisEstablishment, establishment.locationId);
        });
    });

  myEstablishments
    .filter((thisEstablishment) => thisEstablishment._currentLine.LOCATIONID)
    .filter((thisEstablishment) => filterByStatus(thisEstablishment, ['NEW', 'UPDATE', 'CHGSUB']))
    .forEach((thisEstablishment) => {
      return checkDuplicate(thisEstablishment, thisEstablishment._currentLine.LOCATIONID);
    });
};

module.exports = {
  validateDuplicateLocations,
};
