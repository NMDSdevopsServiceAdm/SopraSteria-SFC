const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');
const { fetchAllTrainingCourses, createTrainingCourse, getTrainingCourse } = require('./controllers');

router.route('/').get(hasPermission('canViewWorker'), fetchAllTrainingCourses);
router.route('/').post(hasPermission('canEditWorker'), createTrainingCourse);
router.route('/:trainingCourseId').get(hasPermission('canViewWorker'), getTrainingCourse);
// router
//   .route('/:trainingCourseId')
//   .put(hasPermission('canEditWorker'), editTrainingCourse);
// router
//   .route('/:trainingCourseId')
//   .delete(hasPermission('canEditWorker'), deleteTrainingCourse);

module.exports = router;
