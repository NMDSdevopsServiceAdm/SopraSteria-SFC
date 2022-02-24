const { responseErrors, RegistrationException } = require('./responseErrors');

const saveEstablishmentToDatabase = async (username, establishmentData, newEstablishment, transaction) => {
  initialiseEstablishment(newEstablishment, establishmentData);
  await loadEstablishmentData(newEstablishment, establishmentData);

  if (!newEstablishment.hasMandatoryProperties || !newEstablishment.isValid) {
    throw new RegistrationException(
      'Invalid establishment properties',
      responseErrors.invalidEstablishment.errCode,
      responseErrors.invalidEstablishment.errMessage,
    );
  }

  return await saveEstablishment(username, newEstablishment, transaction);
};

const initialiseEstablishment = (newEstablishment, establishmentData) => {
  newEstablishment.initialise(
    establishmentData.addressLine1,
    establishmentData.addressLine2,
    establishmentData.addressLine3,
    establishmentData.townCity,
    establishmentData.county,
    establishmentData.locationId,
    null, // PROV ID is not captured yet on registration
    establishmentData.postalCode,
    establishmentData.isRegulated,
  );
};

const loadEstablishmentData = async (newEstablishment, establishmentData) => {
  await newEstablishment.load({
    name: establishmentData.locationName,
    mainService: {
      id: establishmentData.mainServiceId,
      other: establishmentData.mainServiceOther,
    },
    ustatus: establishmentData.ustatus,
    expiresSoonAlertDate: establishmentData.expiresSoonAlertDate,
    numberOfStaff: establishmentData.numberOfStaff,
  });

  return newEstablishment;
};

const saveEstablishment = async (username, newEstablishment, t) => {
  await newEstablishment.save(username, false, t);

  return {
    id: newEstablishment.id,
    uid: newEstablishment.uid,
    nmdsId: newEstablishment.nmdsId,
  };
};

module.exports = {
  loadEstablishmentData,
  initialiseEstablishment,
  saveEstablishment,
  saveEstablishmentToDatabase,
};
