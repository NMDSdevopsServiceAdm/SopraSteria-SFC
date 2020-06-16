import { JourneyRoute } from './breadcrumb.model';

enum Path {
  MANDATORY_TRAINING = '/add-mandatory-training',
  DASHBOARD = '/dashboard',

}

export const mandatoryTrainingJourney: JourneyRoute = {
  children: [
    {
      title: 'Mandatory training',
      path: Path.MANDATORY_TRAINING,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'training-and-qualifications',
      },
    },
  ],
};

