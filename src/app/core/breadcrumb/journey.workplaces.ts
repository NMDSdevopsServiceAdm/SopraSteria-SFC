import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/dashboard',
  WORKPLACE = '/workplace/:workplaceUid',
  ALL_WORKPLACES = '/workplace/view-all-workplaces',
  STAFF_RECORD = '/workplace/:workplaceUid/staff-record/:workerUid/staff-record-summary',
  MANDATORY_DETAILS = '/workplace/:workplaceUid/staff-record/:workerUid/mandatory-details',
  USERS = '/workplace/:workplaceUid/users',
  USER_ACCOUNT = '/workplace/:workplaceUid/user/:workerUid',
  USER_PERMISSIONS = '/workplace/:workerUid/user/:workerUid/permissions',
  CREATE_ACCOUNT = '/workplace/:workplaceUid/user/create',
  TRAINING_AND_QUALIFICATIONS_RECORD = '/workplace/:workplaceUid/training-and-qualifications-record/:workerUid/training',
  MANDATORY_TRAINING = '/workplace/:workplaceUid/add-and-manage-mandatory-training',
}

export const workplaceTabJourney: JourneyRoute = {
  children: [
    {
      title: 'Workplace',
      path: Path.DASHBOARD,
      fragment: 'workplace',
    },
  ],
};

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
      title: 'Staff record',
      path: Path.MANDATORY_DETAILS,
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
      title: 'Users',
      path: Path.USERS,
      children: [
        {
          title: 'Add a user',
          path: Path.CREATE_ACCOUNT,
        },
        {
          title: 'User details',
          path: Path.USER_ACCOUNT,
          children: [
            {
              title: 'Permissions',
              path: Path.USER_PERMISSIONS,
            },
          ],
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
              title: 'Staff record',
              path: Path.MANDATORY_DETAILS,
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
              title: 'Add and manage mandatory training categories',
              path: Path.MANDATORY_TRAINING,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'training-and-qualifications',
              },
            },
            {
              title: 'Add a user',
              path: Path.CREATE_ACCOUNT,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'workplace-users',
              },
            },
            {
              title: 'User details',
              path: Path.USER_ACCOUNT,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'workplace-users',
              },
              children: [
                {
                  title: 'Permissions',
                  path: Path.USER_PERMISSIONS,
                  referrer: {
                    path: Path.WORKPLACE,
                    fragment: 'workplace-users',
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
