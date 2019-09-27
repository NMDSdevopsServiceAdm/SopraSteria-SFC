import { JourneyRoute } from './breadcrumb.model';

enum Path {
  REPORTS_LANDING_URL = '/workplace/reports',
  ALL_WORKPLACES = '/workplace/:workplaceUid/reports/workplaces',
  WDF = '/workplace/:workplaceUid/reports/wdf',
  WDF_STAFF_RECORD = '/workplace/:workplaceUid/staff-record/:workerUid/wdf-summary',
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
