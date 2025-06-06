const Establishment = require('../../../models/classes/establishment');

const HttpError = require('../../../utils/errors/httpError');

const updateCareWorkforcePathwayUse = async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    const { careWorkforcePathwayUse } = req.body;

    const thisEstablishment = new Establishment.Establishment(req.username);
    const establishmentFound = await thisEstablishment.restore(establishmentId);

    if (!establishmentFound) {
      throw new HttpError('Establishment is not found', 404);
    }

    const isValidUpdate = await thisEstablishment.load({
      careWorkforcePathwayUse,
    });

    if (!isValidUpdate) {
      throw new HttpError('Invalid request body', 400);
    }

    await thisEstablishment.save(req.username);

    const filteredProperties = ['Name', 'CareWorkforcePathwayUse'];
    const jsonResponse = thisEstablishment.toJSON(false, false, false, false, false, filteredProperties);

    return res.status(200).send(jsonResponse);
  } catch (err) {
    console.error('POST /careWorkforcePathwayUse - failed', err);

    if (err instanceof HttpError) {
      return res.status(err.statusCode).send(err.message);
    }
    return res.status(500).send('Failed to update careWorkforcePathwayUse for workplace with id: ' + establishmentId);
  }
};

module.exports = { updateCareWorkforcePathwayUse };
