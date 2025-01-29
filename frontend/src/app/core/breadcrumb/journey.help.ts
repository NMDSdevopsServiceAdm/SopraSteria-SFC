import { JourneyRoute } from './breadcrumb.model';

enum Path {
  GET_STARTED = '/help/get-started',
}

export const helpJourney: JourneyRoute = {
  children: [
    {
      title: 'Get help and tips: Get started',
      path: Path.GET_STARTED,
    },
  ],
};
