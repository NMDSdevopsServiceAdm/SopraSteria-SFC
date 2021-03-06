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
  BENCHMARKS_PAY,
  BENCHMARKS_SICKNESS,
  BENCHMARKS_TURNOVER,
  BENCHMARKS_QUALIFICATIONS,
  EDIT_USER,
  WDF,
  WDF_PARENT,
  PAGES_ARTICLES,
  BENCHMARKS_SUBSIDIARIES_PAY,
  BENCHMARKS_SUBSIDIARIES_TURNOVER,
  BENCHMARKS_SUBSIDIARIES_SICKNESS,
  BENCHMARKS_SUBSIDIARIES_QUALIFICATIONS,
}

export interface JourneyRoute {
  title?: string;
  path?: string;
  children?: JourneyRoute[];
  referrer?: JourneyRoute;
  fragment?: string;
}
