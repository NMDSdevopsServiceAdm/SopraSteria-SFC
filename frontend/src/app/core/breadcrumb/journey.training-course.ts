import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ADD_AND_MANAGE_TRAINING_COURSES = '/add-and-manage-training-courses',
  DASHBOARD = '/dashboard',
}

export const trainingCourseJourney: JourneyRoute = {
  children: [
    {
      title: 'Add and manage training courses for your workplace',
      path: Path.ADD_AND_MANAGE_TRAINING_COURSES,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'training-and-qualifications',
      },
    },
  ],
};
