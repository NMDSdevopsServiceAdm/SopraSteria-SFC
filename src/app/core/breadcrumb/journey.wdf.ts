import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/dashboard',
  DATA = '/wdf/data',
  STAFF_RECORD = 'wdf/data/staff-record/:id',
  WORKPLACES = 'wdf/workplaces',
  PARENT_DATA = 'wdf/workplaces/:establishmentuid',
  PARENT_STAFF_RECORD = 'wdf/workplaces/:establishmentuid/staff-record/:id',
}

export const wdfJourney: JourneyRoute = {
  children: [
    {
      title: 'WDF data',
      path: Path.DATA,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'wdf',
      },
      fragment: 'staff-records',
      children: [
        {
          title: 'Staff record',
          path: Path.STAFF_RECORD,
          referrer: {
            path: Path.DATA,
            fragment: 'staff-records',
          },
          // referrer: {
          //   path: Path.DASHBOARD,
          //   fragment: 'wdf',
          // },
        },
      ],
    },
  ],
};

export const wdfParentJourney: JourneyRoute = {
  children: [
    {
      title: 'Workplaces',
      path: Path.WORKPLACES,
      referrer: {
        path: Path.DASHBOARD,
        fragment: 'wdf',
      },
      children: [
        {
          title: 'WDF data',
          path: Path.PARENT_DATA,
          children: [
            {
              title: 'Staff record',
              path: Path.PARENT_STAFF_RECORD,
              referrer: {
                path: Path.PARENT_DATA,
                fragment: 'staff-records',
              },
            },
          ],
        },
      ],
    },
  ],
};
