import { JourneyRoute } from './breadcrumb.model';

enum Path {
  REPORTS_LANDING_URL = '/reports',
  ALL_WORKPLACES = '/reports/all-workplaces',
  WDF = '/reports/workplace/:workplaceUid/wdf',
  WDF_STAFF_RECORD = '/reports/workplace/:workplaceUid/staff-record/:workerUid/wdf-summary',
}

export const reportJourney: JourneyRoute = {
  children: [
    {
      title: 'Reports',
      path: Path.REPORTS_LANDING_URL,
      children: [
        {
          title: 'All workplaces',
          path: Path.ALL_WORKPLACES,
        },
        {
          title: 'Workforce Development Fund',
          path: Path.WDF,
          children: [
            {
              title: 'Staff record summary',
              path: Path.WDF_STAFF_RECORD,
              referrer: {
                path: Path.WDF,
                fragment: 'staff-records',
              },
            },
          ],
        },
      ],
    },
  ],
};

export const subsidiaryReportJourney: JourneyRoute = {
  children: [
    {
      title: 'Reports',
      path: Path.REPORTS_LANDING_URL,
      children: [
        {
          title: 'All workplaces',
          path: Path.ALL_WORKPLACES,
          children: [
            {
              title: 'Workforce Development Fund',
              path: Path.WDF,
              children: [
                {
                  title: 'Staff record summary',
                  path: Path.WDF_STAFF_RECORD,
                  referrer: {
                    path: Path.WDF,
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
