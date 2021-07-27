import { JourneyRoute } from './breadcrumb.model';

export const adminJourney: JourneyRoute = {
  path: 'admin',
  title: 'Admin',
  children: [
    {
      path: 'local-authorities-return',
      title: 'Local authorities return',
    },
  ],
};
