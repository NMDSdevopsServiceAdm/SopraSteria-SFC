import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ADMIN = '/sfcadmin',
  LOCAL_AUTHORITIES_RETURN = '/sfcadmin/local-authorities-return',
  SET_DATES = '/sfcadmin/local-authorities-return/set-dates',
  MONITOR_RETURNS = '/sfcadmin/local-authorities-return/monitor',
  LOCAL_AUTHORITY = '/sfcadmin/local-authorities-return/monitor/:uid',
  PENDING = '/sfcadmin/registrations/pending',
  REJECTED = '/sfcadmin/registrations/rejected',
  PENDING_REGISTRATION = '/sfcadmin/registrations/pending/:establishmentUid',
  REJECTED_REGISTRATION = '/sfcadmin/registrations/rejected/:establishmentUid',
  PARENT_REQUESTS = '/sfcadmin/parent-requests',
  PARENT_REQUESTS_INDIVIDUAL = '/sfcadmin/parent-requests/:establishmentUid',
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

export const adminPendingRegistrationJourney: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'Registration requests pending',
          path: Path.PENDING,
          children: [
            {
              title: 'Request',
              path: Path.PENDING_REGISTRATION,
            },
          ],
        },
      ],
    },
  ],
};

export const adminRejectedRegistrationJourney: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'Registration requests rejected',
          path: Path.REJECTED,
          children: [
            {
              title: 'Request',
              path: Path.REJECTED_REGISTRATION,
            },
          ],
        },
      ],
    },
  ],
};

export const adminParentRequestJournery: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'Parent requests',
          path: Path.PARENT_REQUESTS,
          children: [
            {
              title: 'Parent Individual Request',
              path: Path.PARENT_REQUESTS_INDIVIDUAL,
            },
          ],
        },
      ],
    },
  ],
};
