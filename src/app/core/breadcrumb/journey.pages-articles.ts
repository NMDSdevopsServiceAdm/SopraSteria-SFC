import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ARTICLE = '/articles/:slug',
  ABOUT_US = '/about-ascwds',
}

export const pagesArticlesJourney: JourneyRoute = {
  children: [
    {
      title: 'ASC-WDS news',
      path: Path.ARTICLE,
    },
    {
      title: 'About ASC-WDS',
      path: Path.ABOUT_US,
    },
  ],
};
