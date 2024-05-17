import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/subsidiary/:establishmentuid/home',
  WORKPLACE = '/subsidiary/:establishmentuid/workplace',
  STAFF_RECORDS = '/subsidiary/:establishmentuid/staff-records',
  TRAINING_AND_QUALIFICATIONS = '/subsidiary/:establishmentuid/training-and-qualifications',
  BENCHMARKS = '/subsidiary/:establishmentuid/benchmarks',
  WORKPLACE_USERS = '/subsidiary/:establishmentuid/workplace-users',
  USER_DETAILS = 'subsidiary/workplace/:establishmentuid/user/:useruid',
  PERMISSIONS = 'subsidiary/workplace/:establishmentuid/user/:useruid/permissions',
  DELETE_WORKPLACE = '/subsidiary/:establishmentuid/delete-workplace',
}

export const subsidiaryJourney: JourneyRoute = {
  children: [
    {
      title: 'Dashboard',
      path: Path.DASHBOARD,
    },
    {
      title: 'Workplace',
      path: Path.WORKPLACE,
    },
    {
      title: 'Staff records',
      path: Path.STAFF_RECORDS,
    },
    {
      title: 'Training and qualifications',
      path: Path.TRAINING_AND_QUALIFICATIONS,
    },
    {
      title: 'Benchmarks',
      path: Path.BENCHMARKS,
    },
    {
      title: 'Workplace users',
      path: Path.WORKPLACE_USERS,
      children: [
        {
          title: 'User details',
          path: Path.USER_DETAILS,
          children: [
            {
              title: 'Permissions',
              path: Path.PERMISSIONS,
            },
          ],
        },
      ],
    },
    {
      title: 'Delete Workplace',
      path: Path.DELETE_WORKPLACE,
      referrer: {
        path: Path.DASHBOARD,
      },
    },
  ],
};
