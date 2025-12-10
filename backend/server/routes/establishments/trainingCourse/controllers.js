const lodash = require('lodash');
const sequelize = require('sequelize');
const models = require('../../../models');
const HttpError = require('../../../utils/errors/httpError');
const { NotFoundError } = require('../../../utils/errors/customErrors');

const userChangeableFields = [
  'name',
  'accredited',
  'deliveredBy',
  'otherTrainingProviderName',
  'howWasItDelivered',
  'doesNotExpire',
  'validityPeriodInMonth',
];

const fetchAllTrainingCourses = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const trainingCategoryId = req?.query?.trainingCategoryId;

    const recordsFound = await models.trainingCourse.findAll({
      where: {
        establishmentFk: establishmentId,
        archived: false,
        ...(trainingCategoryId ? { categoryFk: trainingCategoryId } : {}),
      },
      include: [
        {
          model: models.workerTrainingCategories,
          as: 'category',
        },
      ],

      attributes: { exclude: ['establishmentFk'] },
      order: [['updated', 'DESC']],
    });

    const trainingCourses = recordsFound.map((record) => record.toJSON()).map(renameKeys);
    const responseBody = { trainingCourses };

    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('GET /establishment/:uid/trainingCourse  - failed', err);
    return res.status(500).send({ message: 'internal server error' });
  }
};

const getTrainingCoursesWithLinkableRecords = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    const allTrainingCourses = await models.trainingCourse.findAll({
      where: {
        establishmentFk: establishmentId,
        archived: false,
      },
      order: [['updated', 'DESC']],
    });

    if (!allTrainingCourses.length) {
      return res.status(200).send({ trainingCourses: [] });
    }

    const establishmentWithWorkersAndTraining = await models.establishment.findWithWorkersAndTraining(establishmentId);
    const allTrainingRecordsInWorkplace = establishmentWithWorkersAndTraining.workers?.flatMap(
      (worker) => worker.workerTraining,
    );

    const allLinkableTrainingRecords = allTrainingRecordsInWorkplace
      .filter((trainingRecord) => !trainingRecord.trainingCourseFK)
      .map((trainingRecord) => trainingRecord.toJSON());

    const groupedByCategoryId = lodash.groupBy(allLinkableTrainingRecords, 'categoryFk');

    const trainingCoursesWithLinkableRecords = allTrainingCourses.map((trainingCourse) => {
      const plainTrainingCourse = renameKeys(trainingCourse.toJSON());
      const linkableTrainingRecords = groupedByCategoryId[plainTrainingCourse.trainingCategoryId] ?? [];
      return { ...plainTrainingCourse, linkableTrainingRecords };
    });

    const showCoursesWithLinkableRecordFirst = (course) => (course.linkableTrainingRecords?.length > 0 ? 1 : 2);

    const sorted = lodash.sortBy(trainingCoursesWithLinkableRecords, [showCoursesWithLinkableRecordFirst, 'name']);

    const responseBody = { trainingCourses: sorted };

    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('GET /establishment/:uid/trainingCourse/getTrainingCoursesWithLinkableRecords - failed', err);
    return res.status(500).send({ message: 'internal server error' });
  }
};

const createTrainingCourse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const categoryFk = req.body?.trainingCategoryId;
    const otherProps = lodash.pick(req.body, userChangeableFields);

    const newEntry = await models.trainingCourse.create({
      ...otherProps,
      establishmentFk: establishmentId,
      categoryFk,
      createdBy: req.username,
      updatedBy: req.username,
    });
    const responseBody = renameKeys(newEntry.dataValues);

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
    const trainingCourseUid = req?.params?.trainingCourseUid;

    const recordFound = await models.trainingCourse.findOne({
      where: {
        establishmentFk: establishmentId,
        uid: trainingCourseUid,
        archived: false,
      },
      include: [
        {
          model: models.workerTrainingCategories,
          as: 'category',
        },
      ],
      attributes: { exclude: ['establishmentFk'] },
      raw: true,
    });

    if (recordFound) {
      const responseBody = renameKeys(recordFound);
      return res.status(200).send(responseBody);
    }

    return res.status(404).send({ message: 'Training course not found' });
  } catch (err) {
    console.error('GET /establishment/:uid/trainingCourse/:uid  - failed', err);
    return res.status(500).send({ message: 'Internal server error' });
  }
};

const updateTrainingCourse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const trainingCourseUid = req?.params?.trainingCourseUid;

    const { updates, updatedBy, applyToExistingRecords } = extractDataFromPatchRequest(req);

    const updatedTrainingCourse = await models.sequelize.transaction(async (transaction) => {
      const updatedTrainingCourse = await models.trainingCourse.updateTrainingCourse({
        establishmentId,
        trainingCourseUid,
        updates,
        updatedBy,
        transaction,
      });
      const trainingRecordsLinkedToCourse = await updatedTrainingCourse.getWorkerTraining({ transaction });

      if (applyToExistingRecords && trainingRecordsLinkedToCourse?.length > 0) {
        const trainingRecordUids = trainingRecordsLinkedToCourse.map((record) => record.uid);
        await models.trainingCourse.updateTrainingRecordsWithCourseData({
          trainingCourseUid,
          trainingRecordUids,
          updatedBy,
          transaction,
        });
      }

      return updatedTrainingCourse;
    });

    const responseBody = renameKeys(updatedTrainingCourse.toJSON());

    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('PUT /establishment/:uid/trainingCourse/:uid  - failed', err);

    if (err instanceof HttpError) {
      return res.status(err.statusCode).send(err.message);
    }
    if (err instanceof NotFoundError) {
      return res.status(404).send('Training course not found');
    }

    return res.status(500).send({ message: 'Internal server error' });
  }
};

const extractDataFromPatchRequest = (req) => {
  if (lodash.isEmpty(req.body)) {
    throw new HttpError('request body is empty', 400);
  }
  const { trainingCourse, applyToExistingRecords } = req.body;
  const updatedBy = req.username;

  if (lodash.isEmpty(trainingCourse)) {
    throw new HttpError('missing "trainingCourse" in request body', 400);
  }
  if (![true, false].includes(applyToExistingRecords)) {
    throw new HttpError('need to specify "applyToExistingRecords" in request body', 400);
  }

  let updates = lodash.pick(trainingCourse, userChangeableFields);
  const trainingProviderFk = trainingCourse.trainingProviderId;
  const categoryFk = trainingCourse.trainingCategoryId;

  if (trainingProviderFk || trainingProviderFk === null) {
    updates.trainingProviderFk = trainingProviderFk;
  }
  if (categoryFk) {
    updates.categoryFk = categoryFk;
  }

  return { updates, updatedBy, applyToExistingRecords };
};

const deleteTrainingCourse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const { trainingCourseUid } = req?.params;

    const deletedCount = await models.trainingCourse.destroy({
      where: {
        uid: trainingCourseUid,
        establishmentFk: establishmentId,
      },
    });

    if (deletedCount === 0) {
      return res.status(404).send({ message: 'Training course not found' });
    }

    return res.status(200).send({ message: 'Training course deleted' });
  } catch (err) {
    console.error('DELETE /establishment/:uid/trainingCourse/:trainingCourseUid - failed', err);

    if (err instanceof sequelize.DatabaseError) {
      return res.status(400).send({ message: 'Invalid request' });
    }

    return res.status(500).send({ message: 'Internal server error' });
  }
};

const updateTrainingRecordsWithCourseDetails = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const trainingCourseUid = req?.params?.trainingCourseUid;
    const trainingRecordUids = req?.body?.trainingRecords?.map((record) => record.uid);
    const updatedBy = req.username;

    if (!trainingRecordUids?.length) {
      throw new HttpError('Missing training record uids in request body', 400);
    }

    const updatedRecords = await models.sequelize.transaction(async (transaction) => {
      await models.trainingCourse.linkRecordsToCourse({
        trainingCourseUid,
        trainingRecordUids,
        establishmentId,
        updatedBy,
        transaction,
      });

      return models.trainingCourse.updateTrainingRecordsWithCourseData({
        trainingCourseUid,
        trainingRecordUids,
        updatedBy,
        transaction,
      });
    });

    const responseBody = { trainingRecords: updatedRecords.map((record) => renameKeys(record.toJSON())) };

    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('POST /establishment/:uid/trainingCourse/:uid/updateTrainingRecordsWithCourseDetails  - failed', err);

    if (err instanceof HttpError) {
      return res.status(err.statusCode).send(err.message);
    }
    if (err instanceof NotFoundError) {
      return res.status(404).send('Training course not found');
    }

    return res.status(500).send({ message: 'Internal server error' });
  }
};

const renameKeys = (record) => {
  const renamed = lodash.mapKeys(record, (_v, key) => {
    switch (key) {
      case 'categoryFk':
        return 'trainingCategoryId';
      case 'trainingProviderFk':
        return 'trainingProviderId';
      default:
        return key;
    }
  });

  if (record?.category) {
    renamed.trainingCategoryName = record.category.category;
  }

  return renamed;
};

module.exports = {
  fetchAllTrainingCourses,
  createTrainingCourse,
  getTrainingCourse,
  updateTrainingCourse,
  deleteTrainingCourse,
  getTrainingCoursesWithLinkableRecords,
  updateTrainingRecordsWithCourseDetails,
};
