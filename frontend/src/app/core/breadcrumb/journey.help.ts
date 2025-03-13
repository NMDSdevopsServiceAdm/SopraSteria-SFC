import { JourneyRoute } from './breadcrumb.model';

enum Path {
  GET_STARTED = '/help/get-started',
  WHATS_NEW = '/help/whats-new',
  HELPFUL_DOWNLOADS = '/help/helpful-downloads',
  QUESTIONS_AND_ANSWERS = '/help/questions-and-answers',
  Q_AND_A_PAGE = '/help/questions-and-answers/:slug',
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
      title: 'Get help and tips: helpful downloads',
      path: Path.HELPFUL_DOWNLOADS,
    },
    {
      title: 'Get help and tips: contact us',
      path: Path.CONTACT_US,
    },
    {
      title: 'Get help and tips: questions and answers',
      path: Path.QUESTIONS_AND_ANSWERS,
    },
    {
      title: 'Get help and tips: questions and answers',
      path: Path.Q_AND_A_PAGE,
    },
  ],
};
