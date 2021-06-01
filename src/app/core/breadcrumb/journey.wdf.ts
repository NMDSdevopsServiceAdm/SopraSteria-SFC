import { JourneyRoute } from './breadcrumb.model';

enum Path {
  OVERVIEW = '/wdf',
  DATA = '/wdf/data',
  STAFF_RECORD = 'wdf/data/staffrecord/:id',
  WORKPLACES = 'wdf/workplaces',
  PARENT_DATA = 'wdf/:id/data',
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

export const wdfParentJourney: JourneyRoute = {
  children: [
    {
      title: 'WDF',
      path: Path.OVERVIEW,
      children: [
        {
          title: 'Workplaces',
          path: Path.WORKPLACES,
          children: [
            {
              title: 'WDF data',
              path: Path.PARENT_DATA,
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
