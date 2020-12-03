import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BENCHMARK_METRIC_PAY = 'workplace/:establishmentUid/benchmarks/pay',
  BENCHMARK_METRIC_SICKNESS = 'workplace/:establishmentUid/benchmarks/sickness',
  BENCHMARK_METRIC_TURNOVER = 'workplace/:establishmentUid/benchmarks/turnover',
  BENCHMARK_METRIC_QUALIFICATIONS = 'workplace/:establishmentUid/benchmarks/qualifications',
  BENCHMARK_RANKINGS = '/rankings',
  DASHBOARD = '/dashboard',
}

const route = (title: string, path: Path, ranking: boolean = false) => {
  let children = {};
  if (ranking) {
    children = {
      children: [
        {
          title: 'Rankings',
          path: Path.BENCHMARK_RANKINGS,
        },
      ],
    };
  }
  return {
    children: [
      {
        title,
        path,
        ...children,
        referrer: {
          path: Path.DASHBOARD,
          fragment: 'benchmarks',
        },
      },
    ],
  };
};

export const benchmarkMetricPayJourney: JourneyRoute = route('Pay', Path.BENCHMARK_METRIC_PAY);
export const benchmarkMetricSicknessJourney: JourneyRoute = route('Sickness', Path.BENCHMARK_METRIC_SICKNESS);
export const benchmarkMetricTurnoverJourney: JourneyRoute = route('Turnover', Path.BENCHMARK_METRIC_TURNOVER);
export const benchmarkMetricQualificationsJourney: JourneyRoute = route(
  'Qualifications',
  Path.BENCHMARK_METRIC_QUALIFICATIONS,
);
export const benchmarkRankingPayJourney: JourneyRoute = route('Pay', Path.BENCHMARK_METRIC_PAY, true);
export const benchmarkRankingTurnoverJourney: JourneyRoute = route('Turnover', Path.BENCHMARK_METRIC_TURNOVER, true);
export const benchmarkRankingSicknessJourney: JourneyRoute = route('Sickness', Path.BENCHMARK_METRIC_SICKNESS, true);
export const benchmarkRankingQualificationsJourney: JourneyRoute = route(
  'Qualifications',
  Path.BENCHMARK_METRIC_QUALIFICATIONS,
  true,
);
