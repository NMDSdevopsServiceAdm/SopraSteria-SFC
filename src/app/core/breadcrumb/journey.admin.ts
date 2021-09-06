import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ADMIN = '/sfcadmin',
  LOCAL_AUTHORITIES_RETURN = '/sfcadmin/local-authorities-return',
  REGISTRATIONS = '/sfcadmin/registrations',
  REGISTRATION_REQUEST = '/sfcadmin/registrations/:establishmentUid',
}

export const adminJourney: JourneyRoute = {
  children: [
    {
      path: Path.ADMIN,
      title: 'Admin',
      children: [
        {
          path: Path.LOCAL_AUTHORITIES_RETURN,
          title: 'Local authorities return',
          children: [
            {
              path: 'set-dates',
              title: 'Set start and end date',
            },
            {
              path: 'monitor',
              title: 'Monitor returns',
              children: [
                {
                  path: ':uid',
                  title: 'Local authority',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: Path.REGISTRATIONS,
      title: 'Registrations',
      children: [
        {
          path: Path.REGISTRATION_REQUEST,
          title: 'Registration request',
        },
      ],
    },
  ],
};
