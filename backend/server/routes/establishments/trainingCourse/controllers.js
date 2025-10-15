const lodash = require('lodash');
const models = require('../../../models');

const acceptedFields = [
  'trainingCategoryId',
  'name',
  'accredited',
  'deliveredBy',
  'externalProviderName',
  'howWasItDelivered',
  'doesNotExpire',
  'validityPeriodInMonth',
];

const fetchAllTrainingCourses = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const trainingCategoryId = req?.query?.trainingCategoryId;

    const recordsFound = await models.TrainingCourse.findAll({
      where: {
        establishmentFk: establishmentId,
        archived: false,
        ...(trainingCategoryId ? { trainingCategoryFk: trainingCategoryId } : {}),
      },
      raw: true,
    });

    const trainingCourses = recordsFound.map(renameKeysFromFkToId);

    return res.status(200).send({ trainingCourses });
  } catch (err) {
    console.error('GET /establishment/:uid/trainingCourse  - failed', err);
    return res.status(500).send('internal server error');
  }
};

const renameKeysFromFkToId = (record) => {
  const trainingCourse = {
    ...record,
    trainingCategoryId: record.categoryFk,
    establishmentId: record.establishmentFk,
  };

  delete trainingCourse.categoryFk;
  delete trainingCourse.establishmentFk;
  return trainingCourse;
};

const createTrainingCourse = async (req, res) => {
  const establishmentId = req.establishmentId;
  const fields = lodash.pick(req.body, acceptedFields);

  const newEntry = await models.TrainingCourse.create({
    ...fields,
    establishmentFk: establishmentId,
    categoryFk: fields.trainingCategoryId,
    createdBy: req.username,
    updatedBy: req.username,
  });

  res.status(200).send(newEntry.dataValues);
};

module.exports = { fetchAllTrainingCourses, createTrainingCourse };
