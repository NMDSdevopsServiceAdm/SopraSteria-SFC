import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/dashboard',
  WORKPLACE = '/workplace/:workplaceUid',
  ALL_WORKPLACES = '/workplace/view-all-workplaces',
  STAFF_RECORD = '/workplace/:workplaceUid/staff-record/:workerUid',
  USER_ACCOUNT = '/workplace/:workplaceUid/user/:workerUid',
  USER_PERMISSIONS = '/workplace/:workerUid/user/:workerUid/permissions',
  CREATE_ACCOUNT = '/workplace/:workplaceUid/user/create',
  TRAINING_AND_QUALIFICATIONS_RECORD = '/workplace/:workplaceUid/training-and-qualifications-record/:workerUid/training',
  NEW_TRAINING_AND_QUALIFICATIONS_RECORD = '/workplace/:workplaceUid/training-and-qualifications-record/:workerUid/new-training',
}

export const myWorkplaceJourney: JourneyRoute = {
  children: [
    {
      title: 'Staff record',
      path: Path.STAFF_RECORD,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'staff-records',
      },
    },
    {
      title: 'Training and qualifications',
      path: Path.TRAINING_AND_QUALIFICATIONS_RECORD,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'training-and-qualifications',
      },
    },
    {
      title: 'Training and qualifications',
      path: Path.NEW_TRAINING_AND_QUALIFICATIONS_RECORD,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'training-and-qualifications',
      },
    },
    {
      title: 'Add a user',
      path: Path.CREATE_ACCOUNT,
    },
    {
      title: 'User details',
      path: Path.USER_ACCOUNT,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'users',
      },
      children: [
        {
          title: 'Permissions',
          path: Path.USER_PERMISSIONS,
          referrer: {
            path: Path.DASHBOARD,
            fragment: 'users',
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
      path: Path.ALL_WORKPLACES,
      children: [
        {
          title: 'Workplace',
          path: Path.WORKPLACE,
          children: [
            {
              title: 'Staff record',
              path: Path.STAFF_RECORD,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'staff-records',
              },
            },
            {
              title: 'Training and qualifications',
              path: Path.TRAINING_AND_QUALIFICATIONS_RECORD,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'training-and-qualifications',
              },
            },
            {
              title: 'Training and qualifications',
              path: Path.NEW_TRAINING_AND_QUALIFICATIONS_RECORD,
              referrer: {
                path: Path.DASHBOARD,
                fragment: 'training-and-qualifications',
              },
            },
            {
              title: 'Add a user',
              path: Path.CREATE_ACCOUNT,
            },
            {
              title: 'User details',
              path: Path.USER_ACCOUNT,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'users',
              },
              children: [
                {
                  title: 'Permissions',
                  path: Path.USER_PERMISSIONS,
                  referrer: {
                    path: Path.WORKPLACE,
                    fragment: 'users',
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
