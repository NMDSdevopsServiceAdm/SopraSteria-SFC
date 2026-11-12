const express = require('express');
const router = express.Router({ mergeParams: true });

const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');
const { isAdmin } = require('../../utils/security/isAuthenticated');
const HttpError = require('../../utils/errors/httpError');

const updateEstablishmentFieldAsAdmin = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    const establishmentClassChanges = extractUpdatedFields(req.body);
    const sequelizeChanges = convertToSequelizeField(establishmentClassChanges);

    const establishment = await models.establishment.findByPk(establishmentId);

    if (!establishment) {
      throw new HttpError('Establishment not found', 404);
    }

    await establishment.updateWithAdminOverrides(sequelizeChanges, establishmentClassChanges);

    const responseBody = extractEstablishmentProperty(establishment);

    return res.status(200).json(responseBody);
  } catch (error) {
    console.error('POST /:establishmentUid/establishmentField/asAdmin - failed', error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).send(error.message);
    }

    return res.status(500).json({ message: 'Failed to update establishment' });
  }
};

const extractUpdatedFields = (requestBody) => {
  const allowedFields = ['numberOfStaff'];

  return allowedFields.reduce((acc, field) => {
    acc[field] = requestBody[field];
    return acc;
  }, {});
};

const convertToSequelizeField = (requestBody) => {
  const numberOfStaff = requestBody?.numberOfStaff;

  return { NumberOfStaffValue: numberOfStaff };
};

const extractEstablishmentProperty = (updatedEstablishment) => {
  const numberOfStaff = Number(updatedEstablishment.NumberOfStaffValue);

  return { numberOfStaff };
};

router.post('/', isAdmin, hasPermission('canEditEstablishment'), updateEstablishmentFieldAsAdmin);

module.exports = { updateEstablishmentFieldAsAdmin, updateEstablishmentFieldAsAdminRouter: router };
