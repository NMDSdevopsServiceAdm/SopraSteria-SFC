import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ARTICLE = '/articles/:slug',
  ABOUT_US = '/about-us',
}

export const pagesArticlesJourney: JourneyRoute = {
  children: [
    {
      title: 'ASC-WDS news',
      path: Path.ARTICLE,
    },
    {
      title: 'About us',
      path: Path.ABOUT_US,
    },
  ],
};
