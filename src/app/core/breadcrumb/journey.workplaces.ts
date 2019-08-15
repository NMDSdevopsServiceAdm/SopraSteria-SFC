import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/dashboard',
  WORKPLACE = '/workplace/:workplaceUid',
  ALL_WORKPLACES = '/workplace/view-all-workplaces',
  STAFF_RECORD = '/workplace/:workplaceUid/staff-record/:workerUid',
  USER_ACCOUNT = '/workplace/:workplaceUid/user/:workerUid',
  USER_PERMISSIONS = '/workplace/:workerUid/user/:workerUid/permissions',
  CREATE_ACCOUNT = '/workplace/:workplaceUid/user/create',
}

export const myWorkplaceJourney: JourneyRoute = {
  children: [
    {
      title: 'Staff record summary',
      url: Path.STAFF_RECORD,
      referrer: {
        url: Path.DASHBOARD,
        fragment: 'staff-records',
      },
    },
    {
      title: 'New user account',
      url: Path.CREATE_ACCOUNT,
    },
    {
      title: 'Account details',
      url: Path.USER_ACCOUNT,
      referrer: {
        url: Path.DASHBOARD,
        fragment: 'user-accounts',
      },
      children: [
        {
          title: 'Permissions',
          url: Path.USER_PERMISSIONS,
          referrer: {
            url: Path.DASHBOARD,
            fragment: 'user-accounts',
          },
        },
      ],
    },
  ],
};

export const allWorkplacesJourney: JourneyRoute = {
  children: [
    {
      title: 'All workplaces',
      url: Path.ALL_WORKPLACES,
      children: [
        {
          title: 'Workplace',
          url: Path.WORKPLACE,
          children: [
            {
              title: 'Staff record summary',
              url: Path.STAFF_RECORD,
              referrer: {
                url: Path.WORKPLACE,
                fragment: 'staff-records',
              },
            },
            {
              title: 'New user account',
              url: Path.CREATE_ACCOUNT,
            },
            {
              title: 'Account details',
              url: Path.USER_ACCOUNT,
              referrer: {
                url: Path.WORKPLACE,
                fragment: 'user-accounts',
              },
              children: [
                {
                  title: 'Permissions',
                  url: Path.USER_PERMISSIONS,
                  referrer: {
                    url: Path.WORKPLACE,
                    fragment: 'user-accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
