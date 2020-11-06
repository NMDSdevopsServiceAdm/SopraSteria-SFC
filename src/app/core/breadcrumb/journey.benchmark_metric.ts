import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BENCHMARK_METRIC_PAY = '/pay',
  BENCHMARK_METRIC_SICKNESS = '/sickness',
  BENCHMARK_METRIC_TURNOVER = '/turnover',
  BENCHMARK_METRIC_QUALIFICATIONS = '/qualifications',
  DASHBOARD = '/dashboard',
}

const route = (title: string, path: Path) => {
  return {
    children: [
      {
        title,
        path,
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
