import { JourneyRoute } from './breadcrumb.model';

enum Path {
  UPDATE_RECORDS_WITH_TRAINING_COURSE_DETAILS = '/update-records-with-training-course-details',
  DASHBOARD = '/dashboard',
}

export const updateRecordsWithTrainingCourseDetailsJourney: JourneyRoute = {
  children: [
    {
      title: 'Select a training course',
      path: Path.UPDATE_RECORDS_WITH_TRAINING_COURSE_DETAILS,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'training-and-qualifications',
      },
    },
  ],
};
