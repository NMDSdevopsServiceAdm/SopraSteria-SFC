const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');
const {
  fetchAllTrainingCourses,
  createTrainingCourse,
  getTrainingCourse,
  updateTrainingCourse,
} = require('./controllers');

router.route('/').get(hasPermission('canViewWorker'), fetchAllTrainingCourses);
router.route('/').post(hasPermission('canEditWorker'), createTrainingCourse);
router.route('/:trainingCourseUid').get(hasPermission('canViewWorker'), getTrainingCourse);
router.route('/:trainingCourseUid').put(hasPermission('canEditWorker'), updateTrainingCourse);

module.exports = router;
