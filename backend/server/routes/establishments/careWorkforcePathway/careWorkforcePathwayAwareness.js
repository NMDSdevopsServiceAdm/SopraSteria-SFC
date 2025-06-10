
const Establishment = require('../../../models/classes/establishment');
const HttpError = require('../../../utils/errors/httpError');

const updateCareWorkforcePathwayAwareness = async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    const thisEstablishment = new Establishment.Establishment(req.username);
    const establishmentFound = await thisEstablishment.restore(establishmentId);

    if (!establishmentFound) {
      throw new HttpError('Establishment not found', 404);
    }

    const { careWorkforcePathwayWorkplaceAwareness } = req.body

    const isValidEstablishment = await thisEstablishment.load({careWorkforcePathwayWorkplaceAwareness })

    if(isValidEstablishment){
      await thisEstablishment.save(req.username)

    } else {
      throw new HttpError('Request is invalid', 400);
    }

    const filteredProperties = ['Name', 'careWorkforcePathwayWorkplaceAwareness'];
    const jsonResponse = thisEstablishment.toJSON(false, false, false, true, false, filteredProperties);

    return res.status(200).send(jsonResponse);
  } catch (error) {
    console.error('Establishment: POST: ', error.message);
    if (error instanceof HttpError) {
       return res.status(error.statusCode).send(error.message);
    }
    return res.status(500).send('Failed to update careWorkforcePathwayAwareness for workplace')
  }
};

module.exports = { updateCareWorkforcePathwayAwareness }
