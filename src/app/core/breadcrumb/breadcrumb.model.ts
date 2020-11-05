export enum JourneyType {
  PUBLIC,
  ACCOUNT,
  BULK_UPLOAD,
  MY_WORKPLACE,
  ALL_WORKPLACES,
  REPORTS,
  SUBSIDIARY_REPORTS,
  NOTIFICATIONS,
  MANDATORY_TRAINING,
  BENCHMARK_METRIC_PAY,
  BENCHMARK_METRIC_SICKNESS,
  BENCHMARK_METRIC_TURNOVER,
  BENCHMARK_METRIC_QUALIFICATIONS,
  EDIT_USER,
}

export interface JourneyRoute {
  title?: string;
  path?: string;
  children?: JourneyRoute[];
  referrer?: JourneyRoute;
  fragment?: string;
}
