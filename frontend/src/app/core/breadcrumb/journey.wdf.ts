import { JourneyRoute } from './breadcrumb.model';

enum Path {
  OVERVIEW = '/funding',
  LEARN_MORE = 'funding/learn-more',
  FUNDING_REQUIREMENTS = 'funding/funding-requirements',
  DATA = '/funding/data',
  STAFF_RECORD = 'funding/staff-record/:id',
  PARENT_DATA = 'funding/workplaces/:establishmentuid',
  PARENT_STAFF_RECORD = 'funding/workplaces/:establishmentuid/staff-record/:id',
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
