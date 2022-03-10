import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BENCHMARKS_PAY = 'workplace/:establishmentUid/benchmarks/pay',
  BENCHMARKS_SICKNESS = 'workplace/:establishmentUid/benchmarks/sickness',
  BENCHMARKS_TURNOVER = 'workplace/:establishmentUid/benchmarks/turnover',
  BENCHMARKS_QUALIFICATIONS = 'workplace/:establishmentUid/benchmarks/qualifications',
  BENCHMARKS_RANKINGS = '/rankings',
  DASHBOARD = '/dashboard',
}

const route = (title: string, path: Path) => {
  return {
    children: [
      {
        title: title,
        path: path,
        referrer: {
          path: Path.DASHBOARD,
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
  };
};

export const benchmarksPayJourney: JourneyRoute = route('Pay', Path.BENCHMARKS_PAY);
export const benchmarksSicknessJourney: JourneyRoute = route('Sickness', Path.BENCHMARKS_SICKNESS);
export const benchmarksTurnoverJourney: JourneyRoute = route('Turnover', Path.BENCHMARKS_TURNOVER);
export const benchmarksQualificationsJourney: JourneyRoute = route('Qualifications', Path.BENCHMARKS_QUALIFICATIONS);
