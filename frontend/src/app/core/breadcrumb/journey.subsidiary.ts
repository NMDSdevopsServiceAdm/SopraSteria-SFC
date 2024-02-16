import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD                   = '/subsidiary/dashboard/:subsidiaryUid',
  WORKPLACE                   = '/subsidiary/workplace/:subsidiaryUid',
  STAFF_RECORDS               = '/subsidiary/staff_records/:subsidiaryUid',
  TRAINING_AND_QUALIFICATIONS = '/subsidiary/training_and_qualifications/:subsidiaryUid',
  BENCHMARKS                  = '/subsidiary/benchmarks/:subsidiaryUid',
  WORKPLACE_USERS             = '/subsidiary/workplace_users/:subsidiaryUid',
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
  ],
};