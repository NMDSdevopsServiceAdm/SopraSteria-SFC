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
  ABOUT_DATA = '/workplace/:workplaceUid/data-area/about-the-data',
  BENCHMARKS_ABOUT_DATA = '/workplace/:workplaceUid/benchmarks/about-the-data',
  OTHER_WORKPLACES = '/workplace/other-workplaces',
  ABOUT_PARENTS = '/workplace/about-parents',
  CHANGE_DATA_OWNER = '/workplace/change-data-owner',
  DELETE_WORKPLACE = '/delete-workplace',
}

export const workplaceTabJourney: JourneyRoute = {
  children: [
    {
      title: 'Workplace',
      path: Path.DASHBOARD,
      fragment: 'workplace',
      children: [
        {
          title: 'What you can do as a parent workplace',
          path: Path.ABOUT_PARENTS,
          referrer: {
            path: Path.WORKPLACE,
            fragment: 'about-parents',
          },
        },
      ],
    },
  ],
};

export const staffRecordsTabJourney: JourneyRoute = {
  children: [
    {
      title: 'Staff records',
      path: Path.DASHBOARD,
      fragment: 'staff-records',
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
      ],
    },
  ],
};

export const trainingAndQualificationsTabJourney: JourneyRoute = {
  children: [
    {
      title: 'Training and qualifications',
      path: Path.DASHBOARD,
      fragment: 'training-and-qualifications',
      children: [
        {
          title: 'Training and qualifications',
          path: Path.TRAINING_AND_QUALIFICATIONS_RECORD,
          referrer: {
            path: Path.DASHBOARD,
            fragment: 'training-and-qualifications',
          },
        },
      ],
    },
  ],
};

export function benchmarksTabJourney(isOldTab: boolean = false): JourneyRoute {
  return {
    children: [
      {
        title: 'Benchmarks',
        path: Path.DASHBOARD,
        fragment: 'benchmarks',
        children: [
          {
            title: 'About the data',
            path: isOldTab ? Path.BENCHMARKS_ABOUT_DATA : Path.ABOUT_DATA,
          },
        ],
      },
    ],
  };
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
      title: 'Your other workplaces',
      path: Path.ALL_WORKPLACES,
      fragment: 'workplaces',
      children: [
        {
          title: 'What you can do as a parent workplace',
          path: Path.ABOUT_PARENTS,
          referrer: {
            path: Path.WORKPLACE,
            fragment: 'about-parents',
          },
        },
        {
          title: 'Change data owner',
          path: Path.CHANGE_DATA_OWNER,
        },
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

export const deleteWorkplaceJourney: JourneyRoute = {
  children: [
    {
      title: 'Delete workplace',
      path: Path.DELETE_WORKPLACE,
      referrer: {
        path: Path.DASHBOARD,
      },
    },
  ],
};
