const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');
const { fetchAllTrainingCourses, createTrainingCourse } = require('./controllers');

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
