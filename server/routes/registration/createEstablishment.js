const { responseErrors, RegistrationException } = require('./responseErrors');
const Establishment = require('../../models/classes/establishment').Establishment;
const models = require('../../models');

const OTHER_MAX_LENGTH = 120;

const createEstablishment = async (reqEstablishment, username, transaction) => {
  if (!reqEstablishment.isRegulated) {
    delete reqEstablishment.locationId;
  }

  const establishmentData = {
    ...reqEstablishment,
    ustatus: 'PENDING',
    expiresSoonAlertDate: '90',
    mainServiceId: null,
  };

  establishmentData.mainServiceId = await getMainServiceId(establishmentData);

  const newEstablishment = new Establishment(username);

  return await saveEstablishmentToDatabase(username, establishmentData, newEstablishment, transaction);
};

const saveEstablishmentToDatabase = async (username, establishmentData, newEstablishment, transaction) => {
  initialiseEstablishment(newEstablishment, establishmentData);
  await loadEstablishmentData(newEstablishment, establishmentData);

  if (!newEstablishment.hasMandatoryProperties || !newEstablishment.isValid) {
    throw new RegistrationException(responseErrors.invalidEstablishment);
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
  };
};

const getMainServiceId = async (establishmentData) => {
  const mainService = await models.services.getMainServiceByName(
    establishmentData.mainService,
    establishmentData.isRegulated,
  );

  if (!mainService || mainServiceOtherNameIsTooLong(mainService, establishmentData)) {
    throw new RegistrationException(responseErrors.unexpectedMainService);
  }

  return mainService.id;
};

const mainServiceOtherNameIsTooLong = (mainService, establishmentData) =>
  mainService.other &&
  establishmentData.mainServiceOther &&
  establishmentData.mainServiceOther.length > OTHER_MAX_LENGTH;

module.exports = {
  loadEstablishmentData,
  initialiseEstablishment,
  saveEstablishment,
  saveEstablishmentToDatabase,
  createEstablishment,
  getMainServiceId,
};
