import { JourneyRoute } from './breadcrumb.model';

enum Path {
  REPORTS_LANDING_URL = '/workplace/:workplaceUid/reports',
  WDF = '/workplace/:workplaceUid/reports/wdf',
  WDF_STAFF_RECORD = '/workplace/:workplaceUid/staff-record/:workerUid/wdf-summary',
}

export const reportJourney: JourneyRoute = {
  children: [
    {
      title: 'Reports',
      url: Path.REPORTS_LANDING_URL,
      children: [
        {
          title: 'Workforce Development Fund',
          url: Path.WDF,
          children: [
            {
              title: 'Staff record summary',
              url: Path.WDF_STAFF_RECORD,
              referrer: {
                url: Path.WDF,
                fragment: 'staff-records',
              },
            },
          ],
        },
      ],
    },
  ],
};
