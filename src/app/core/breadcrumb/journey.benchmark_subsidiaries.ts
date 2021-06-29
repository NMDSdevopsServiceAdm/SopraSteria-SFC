import { JourneyRoute } from './breadcrumb.model';

enum Path {
  WORKPLACE = '/workplace/:workplaceUid',
  ALL_WORKPLACES = '/workplace/view-all-workplaces',
  BENCHMARKS_PAY = '/workplace/:workplaceUid/benchmarks/pay',
  BENCHMARKS_TURNOVER = '/workplace/:workplaceUid/benchmarks/turnover',
  BENCHMARKS_SICKNESS = '/workplace/:workplaceUid/benchmarks/sickness',
  BENCHMARKS_QUALIFICATIONS = '/workplace/:workplaceUid/benchmarks/qualifications',
  BENCHMARKS_RANKINGS = '/rankings',
  DASHBOARD = '/dashboard',
}

const route = (title: string, path: Path) => {
  return {
    children: [
      {
        title: 'All workplaces',
        path: Path.ALL_WORKPLACES,
        children: [
          {
            title: 'Workplace',
            path: Path.WORKPLACE,
            children: [
              {
                title: title,
                path: path,
                referrer: {
                  path: Path.WORKPLACE,
                  fragment: 'benchmarks',
                },
                children: [
                  {
                    title: 'Rankings',
                    path: Path.BENCHMARKS_RANKINGS,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};

export const benchmarksSubsidiariesPayJourney: JourneyRoute = route('Pay', Path.BENCHMARKS_PAY);
export const benchmarksSubsidiariesTurnoverJourney: JourneyRoute = route('Turnover', Path.BENCHMARKS_TURNOVER);
export const benchmarksSubsidiariesSicknessJourney: JourneyRoute = route('Sickness', Path.BENCHMARKS_SICKNESS);
export const benchmarksSubsidiariesQualificationsJourney: JourneyRoute = route(
  'Qualifications',
  Path.BENCHMARKS_QUALIFICATIONS,
);
