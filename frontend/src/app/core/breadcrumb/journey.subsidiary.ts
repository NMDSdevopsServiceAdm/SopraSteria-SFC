import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/subsidiary/home/:establishmentuid',
  WORKPLACE = '/subsidiary/workplace/:establishmentuid',
  STAFF_RECORDS = '/subsidiary/staff-records/:establishmentuid',
  TRAINING_AND_QUALIFICATIONS = '/subsidiary/training-and-qualifications/:establishmentuid',
  BENCHMARKS = '/subsidiary/benchmarks/:establishmentuid',
  WORKPLACE_USERS = '/subsidiary/workplace-users/:establishmentuid',
  ABOUT_DATA = '/subsidiary/workplace/:establishmentuid/data-area/about-the-data',
}

export const subsidiaryJourney: JourneyRoute = {
  children: [
    {
      title: 'Dashboard',
      path: Path.DASHBOARD,
      fragment: 'home',
    },
    {
      title: 'Workplace',
      path: Path.WORKPLACE,
      fragment: 'workplace',
    },
    {
      title: 'Staff records',
      path: Path.STAFF_RECORDS,
      fragment: 'staff-records',
    },
    {
      title: 'Training and qualifications',
      path: Path.TRAINING_AND_QUALIFICATIONS,
      fragment: 'training-and-qualifications',
    },
    {
      title: 'Benchmarks',
      path: Path.BENCHMARKS,
      fragment: 'benchmarks',
    },
    {
      title: 'Workplace users',
      path: Path.WORKPLACE_USERS,
      fragment: 'workplace-users',
    },
    {
      title: 'About the data',
      path: Path.ABOUT_DATA,
      fragment: 'benchmark',
    },
  ],
};