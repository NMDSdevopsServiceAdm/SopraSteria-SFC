import { JourneyRoute } from './breadcrumb.model';

enum Path {
  DASHBOARD = '/dashboard',
  OVERVIEW = '/wdf',
  DATA = '/wdf/data',
  STAFF_RECORD = 'wdf/data/staff-record/:id',
  WORKPLACES = 'wdf/workplaces',
  PARENT_DATA = 'wdf/workplaces/:establishmentuid',
  PARENT_STAFF_RECORD = 'wdf/workplaces/:establishmentuid/staff-record/:id',
  FIND_OUT_MORE = 'wdf/find-out-more',
}

export const wdfJourney: JourneyRoute = {
  children: [
    {
      title: 'Meeting funding requirements?',
      path: Path.OVERVIEW,
      children: [
        {
          title: 'Find out more',
          path: Path.FIND_OUT_MORE,
        },
        {
          title: 'WDF data',
          path: Path.DATA,
          children: [
            {
              title: 'Staff record',
              path: Path.STAFF_RECORD,
              referrer: {
                path: Path.DATA,
                fragment: 'staff-records',
              },
            },
          ],
        },
      ],
    },
  ],
};

export const wdfParentJourney: JourneyRoute = {
  children: [
    {
      title: 'Meeting funding requirements?',
      path: Path.OVERVIEW,
      children: [
        {
          title: 'Workplaces',
          path: Path.WORKPLACES,
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
    },
  ],
};
