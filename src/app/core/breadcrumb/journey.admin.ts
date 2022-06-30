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
  CQC_MAIN_SERVICE_CHANGE = '/sfcadmin/cqc-main-service-change',
  CQC_MAIN_SERVICE_CHANGE_REQUEST = '/sfcadmin/cqc-main-service -change/:establishmentUid',
  ADMIN_USERS = '/sfcadmin/users',
  ADD_ADMIN_USER_DETAILS = '/sfcadmin/users/add-admin-user-details',
  VIEW_ADMIN_USER_DETAILS = '/sfcadmin/users/:useruid',
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

export const adminCqcStatusChangeJournery: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'CQC main service change',
          path: Path.CQC_MAIN_SERVICE_CHANGE,
          children: [
            {
              title: 'Request',
              path: Path.CQC_MAIN_SERVICE_CHANGE_REQUEST,
            },
          ],
        },
      ],
    },
  ],
};

export const adminUserJourney: JourneyRoute = {
  children: [
    {
      title: 'Admin',
      path: Path.ADMIN,
      children: [
        {
          title: 'Admin users',
          path: Path.ADMIN_USERS,
          children: [
            {
              title: 'Add admin user details',
              path: Path.ADD_ADMIN_USER_DETAILS,
            },
            {
              title: 'Admin user details',
              path: Path.VIEW_ADMIN_USER_DETAILS,
            },
          ],
        },
      ],
    },
  ],
};
