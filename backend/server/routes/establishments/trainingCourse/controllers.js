const lodash = require('lodash');
const sequelize = require('sequelize');
const models = require('../../../models');

const userChangeableFields = [
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
        ...(trainingCategoryId ? { categoryFk: trainingCategoryId } : {}),
      },
      raw: true,
    });

    const trainingCourses = recordsFound.map(renameKeysFromFkToId);
    const responseBody = { trainingCourses };

    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('GET /establishment/:uid/trainingCourse  - failed', err);
    return res.status(500).send({ message: 'internal server error' });
  }
};

const createTrainingCourse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const categoryFk = req.body?.trainingCategoryId;
    const otherProps = lodash.pick(req.body, userChangeableFields);

    const newEntry = await models.TrainingCourse.create({
      ...otherProps,
      establishmentFk: establishmentId,
      categoryFk,
      createdBy: req.username,
      updatedBy: req.username,
    });
    const responseBody = renameKeysFromFkToId(newEntry.dataValues);

    res.status(200).send(responseBody);
  } catch (err) {
    console.error('POST /establishment/:uid/trainingCourse  - failed', err);
    if (err instanceof sequelize.DatabaseError || err instanceof sequelize.ValidationError) {
      return res.status(400).send({ message: 'Invalid request' });
    }
    return res.status(500).send({ message: 'Internal server error' });
  }
};

const getTrainingCourse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const trainingCourseId = req?.params?.trainingCourseId;

    const recordFound = await models.TrainingCourse.findOne({
      where: {
        establishmentFk: establishmentId,
        id: trainingCourseId,
        archived: false,
      },
      raw: true,
    });

    if (recordFound) {
      const responseBody = renameKeysFromFkToId(recordFound);
      return res.status(200).send(responseBody);
    }

    return res.status(404).send({ message: 'Training course not found' });
  } catch (err) {
    console.error('GET /establishment/:uid/trainingCourse/:id  - failed', err);
    return res.status(500).send({ message: 'Internal server error' });
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

module.exports = { fetchAllTrainingCourses, createTrainingCourse, getTrainingCourse };
