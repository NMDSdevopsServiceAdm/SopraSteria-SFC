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
  BENCHMARKS_PAY = '/workplace/:workplaceUid/benchmarks/pay',
  BENCHMARKS_TURNOVER = '/workplace/:workplaceUid/benchmarks/turnover',
  BENCHMARKS_SICKNESS = '/workplace/:workplaceUid/benchmarks/sickness',
  BENCHMARKS_QUALIFICATIONS = '/workplace/:workplaceUid/benchmarks/qualifications',
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
              title: 'Pay',
              path: Path.BENCHMARKS_PAY,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'benchmarks',
              },
            },
            {
              title: 'Turnover',
              path: Path.BENCHMARKS_TURNOVER,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'benchmarks',
              },
            },
            {
              title: 'Sickness',
              path: Path.BENCHMARKS_SICKNESS,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'benchmarks',
              },
            },
            {
              title: 'Qualifications',
              path: Path.BENCHMARKS_QUALIFICATIONS,
              referrer: {
                path: Path.WORKPLACE,
                fragment: 'benchmarks',
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
