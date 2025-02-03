import { JourneyRoute } from './breadcrumb.model';

enum Path {
  GET_STARTED = '/help/get-started',
  WHATS_NEW = '/help/whats-new',
}

export const helpJourney: JourneyRoute = {
  children: [
    {
      title: 'Get help and tips: get started',
      path: Path.GET_STARTED,
    },
    {
      title: "Get help and tips: what's new",
      path: Path.WHATS_NEW,
    },
  ],
};
