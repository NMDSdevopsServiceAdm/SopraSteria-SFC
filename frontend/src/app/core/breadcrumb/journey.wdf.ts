import { JourneyRoute } from './breadcrumb.model';

enum Path {
  OVERVIEW = '/wdf',
  LEARN_MORE = 'wdf/learn-more',
  FUNDING_REQUIREMENTS = 'wdf/funding-requirements',
  DATA = '/wdf/data',
  STAFF_RECORD = 'wdf/staff-record/:id',
  PARENT_DATA = 'wdf/workplaces/:establishmentuid',
  PARENT_STAFF_RECORD = 'wdf/workplaces/:establishmentuid/staff-record/:id',
}

export const wdfJourney: JourneyRoute = {
  children: [
    {
      title: 'Meeting funding requirements?',
      path: Path.OVERVIEW,
      children: [
        {
          title: 'Learn more',
          path: Path.LEARN_MORE,
        },
        {
          title: 'Funding requirements',
          path: Path.FUNDING_REQUIREMENTS,
        },
        {
          title: 'Your data',
          path: Path.DATA,
          children: [
            {
              title: 'Staff record',
              path: Path.STAFF_RECORD,
            },
            {
              title: 'Other workplace: data',
              path: Path.PARENT_DATA,
              children: [
                {
                  title: 'Staff record',
                  path: Path.PARENT_STAFF_RECORD,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
