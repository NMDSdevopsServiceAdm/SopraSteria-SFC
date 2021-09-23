import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ADMIN = '/sfcadmin',
  LOCAL_AUTHORITIES_RETURN = '/sfcadmin/local-authorities-return',
  SET_DATES = '/sfcadmin/local-authorities-return/set-dates',
  MONITOR_RETURNS = '/sfcadmin/local-authorities-return/monitor',
  LOCAL_AUTHORITY = '/sfcadmin/local-authorities-return/monitor/:uid',
  PENDING = '/sfcadmin/registrations/pending',
  REJECTED = '/sfcadmin/registrations/rejected',
  SINGLE_REGISTRATION = '/sfcadmin/registrations/:establishmentUid',
  REGISTRATION_REQUESTS = '/sfcadmin/registrations',
}

export const adminJourney: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'Local authorities return',
          path: Path.LOCAL_AUTHORITIES_RETURN,
          children: [
            {
              title: 'Set start and end date',
              path: Path.SET_DATES,
            },
            {
              title: 'Monitor returns',
              path: Path.MONITOR_RETURNS,
              children: [
                {
                  title: 'Local authority',
                  path: Path.LOCAL_AUTHORITY,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const adminRegistrationJourney: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'Registration requests pending',
          path: Path.PENDING,
        },
        {
          title: 'Registration requests rejected',
          path: Path.REJECTED,
        },
        {
          title: 'Registration requests',
          path: Path.REGISTRATION_REQUESTS,
          children: [
            {
              path: Path.SINGLE_REGISTRATION,
              title: 'Request',
            },
          ],
        },
      ],
    },
  ],
};
