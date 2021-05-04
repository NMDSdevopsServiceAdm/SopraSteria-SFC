import { JourneyRoute } from './breadcrumb.model';

enum Path {
  OVERVIEW = '/wdf',
  DATA = '/wdf/data',
  STAFF_RECORD = 'wdf/data/staffrecord/:id',
}

export const wdfJourney: JourneyRoute = {
  children: [
    {
      title: 'WDF',
      path: Path.OVERVIEW,
      children: [
        {
          title: 'WDF data',
          path: Path.DATA,
          children: [
            {
              title: 'Staff record',
              path: Path.STAFF_RECORD,
            },
          ],
        },
      ],
    },
  ],
};
