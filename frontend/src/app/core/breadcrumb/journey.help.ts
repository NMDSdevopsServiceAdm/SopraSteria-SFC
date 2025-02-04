import { JourneyRoute } from './breadcrumb.model';

enum Path {
  GET_STARTED = '/help/get-started',
  WHATS_NEW = '/help/whats-new',
  HELPFUL_DOWNLOADS = '/help/useful-downloads',
  CONTACT_US = '/help/contact-us',
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
    {
      title: 'Get help and tips: useful downloads',
      path: Path.HELPFUL_DOWNLOADS,
    },
    {
      title: 'Get help and tips: contact us',
      path: Path.CONTACT_US,
    }
  ],
};
