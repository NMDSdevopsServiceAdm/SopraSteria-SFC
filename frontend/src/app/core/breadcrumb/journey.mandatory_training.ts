import { JourneyRoute } from './breadcrumb.model';

enum Path {
  MANDATORY_TRAINING = '/add-and-manage-mandatory-training',
  DASHBOARD = '/dashboard',
}

export const mandatoryTrainingJourney: JourneyRoute = {
  children: [
    {
      title: 'Add and manage mandatory training categories',
      path: Path.MANDATORY_TRAINING,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'training-and-qualifications',
      },
    },
  ],
};
