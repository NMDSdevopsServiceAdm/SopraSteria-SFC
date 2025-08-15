const Establishment = require('../../models/classes/establishment');
const HttpError = require('../../utils/errors/httpError');

const updateStaffKindDelegatedHealthcareActivities = async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    const thisEstablishment = new Establishment.Establishment(req.username);
    const establishmentFound = await thisEstablishment.restore(establishmentId);

    if (!establishmentFound) {
      throw new HttpError('Establishment not found', 404);
    }

    const { knowWhatActivities, activities } = req.body;

    const isValidUpdate = await thisEstablishment.load({
      staffWhatKindDelegatedHealthcareActivities: { knowWhatActivities, activities },
    });

    if (!isValidUpdate) {
      throw new HttpError('Invalid request', 400);
    }

    await thisEstablishment.save(req.username);

    let filteredProperties = ['Name', 'StaffWhatKindDelegatedHealthcareActivities'];
    const jsonResponse = thisEstablishment.toJSON(false, false, false, false, false, filteredProperties);

    return res.status(200).send(jsonResponse);
  } catch (error) {
    console.error('POST /updateStaffKindDelegatedHealthcareActivities - failed', error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).send(error.message);
    }

    return res
      .status(500)
      .send('Failed to update staffKindDelegatedHealthcareActivities for workplace with id: ' + establishmentId);
  }
};

module.exports = updateStaffKindDelegatedHealthcareActivities;
