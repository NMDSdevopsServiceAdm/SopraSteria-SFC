const express = require('express');
const lodash = require('lodash');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');
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
  const establishmentId = req.establishmentId;
  console.log(req.query, '<--- req');
  const trainingCoursesFound = await models.TrainingCourse.findAll({
    where: {
      establishmentFk: establishmentId,
      archived: false,
    },
    raw: true,
  });
  trainingCoursesFound.forEach((record) => {
    record.trainingCategoryId = record.categoryFk;
    record.establishmentId = record.establishmentFk;
    delete record.categoryFk;
    delete record.establishmentFk;
  });

  return res.status(200).send({ trainingCourses: trainingCoursesFound });
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

// const modifyTrainingCourse = async (req, res) => {};

router.route('/').get(hasPermission('canViewWorker'), fetchAllTrainingCourses);
router.route('/').post(hasPermission('canEditWorker'), createTrainingCourse);
// router
//   .route('/:trainingCourseId')
//   .get(hasPermission(hasPermission('canViewWorker'), getTrainingCourse);
// router
//   .route('/:trainingCourseId')
//   .put(hasPermission(hasPermission('canEditWorker'), modifyTrainingCourse);
// router
//   .route('/:trainingCourseId')
//   .delete(hasPermission(hasPermission('canEditWorker'), deleteTrainingCourse);

module.exports = router;
