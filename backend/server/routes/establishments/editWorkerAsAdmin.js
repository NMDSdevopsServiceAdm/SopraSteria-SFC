const models = require('../../models');
const HttpError = require('../../utils/errors/httpError');

const editWorkerAsAdmin = async (req, res) => {
  try {
    const workerUid = req.params.workerId;
    const establishmentId = req.establishmentId;

    const workerClassChanges = extractUpdatedFields(req.body);
    const sequelizeChanges = convertToSequelizeField(workerClassChanges);

    const worker = await models.worker.findOne({
      where: {
        uid: workerUid,
        establishmentFk: establishmentId,
      },
    });

    if (!worker) {
      throw new HttpError('Worker not found', 404);
    }

    await worker.updateWorkerWithAdminOverrides(sequelizeChanges, workerClassChanges);

    const responseBody = extractWorkerProperty(worker);

    return res.status(200).json(responseBody);
  } catch (error) {
    console.error('worker::PUT/:workerId/asAdmin - failed', error);

    if (error instanceof HttpError) {
      return res.status(error.statusCode).send(error.message);
    }

    return res.status(500).json({ message: 'Failed to update worker' });
  }
};

const extractUpdatedFields = (requestBody) => {
  const allowedFields = ['annualHourlyPay'];

  return allowedFields.reduce((acc, field) => {
    acc[field] = requestBody[field];
    return acc;
  }, {});
};

const convertToSequelizeField = (requestBody) => {
  const annualHourlyPay = requestBody?.annualHourlyPay;
  const { rate, value } = annualHourlyPay;

  return { AnnualHourlyPayValue: value, AnnualHourlyPayRate: rate ?? null };
};

const extractWorkerProperty = (updatedWorker) => {
  const value = updatedWorker.AnnualHourlyPayValue;
  const rate = Number(updatedWorker.AnnualHourlyPayRate);

  return { annualHourlyPay: { value, rate } };
};

module.exports = { editWorkerAsAdmin };
