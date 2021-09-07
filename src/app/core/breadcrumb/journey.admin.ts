import { JourneyRoute } from './breadcrumb.model';

export const adminJourney: JourneyRoute = {
  children: [
    {
      path: '/sfcadmin',
      title: 'Admin',
      children: [
        {
          path: '/sfcadmin/registrations',
          title: 'Registrations',
          children: [
            {
              path: '/sfcadmin/registrations/:establishmentUid',
              title: 'Registration Request',
            },
          ],
        },
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
              children: [
                {
                  path: '/sfcadmin/local-authorities-return/monitor/:uid',
                  title: 'Local authority',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
