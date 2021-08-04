import { JourneyRoute } from './breadcrumb.model';

export const adminJourney: JourneyRoute = {
  children: [
    {
      path: '/sfcadmin',
      title: 'Admin',
      children: [
        {
          path: '/sfcadmin/local-authorities-return',
          title: 'Local authorities return',
          children: [
            {
              path: '/sfcadmin/local-authorities-return/set-dates',
              title: 'Set start and end date',
            },
            {
              path: '/sfcadmin/local-authorities-return/monitor',
              title: 'Monitor returns',
            },
          ],
        },
      ],
    },
  ],
};
