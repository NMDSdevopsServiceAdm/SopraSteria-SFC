export enum JourneyType {
  PUBLIC,
  ACCOUNT,
  BULK_UPLOAD,
  MY_WORKPLACE,
  ALL_WORKPLACES,
  REPORTS,
}

export interface JourneyRoute {
  title?: string;
  url?: string;
  children?: JourneyRoute[];
  referrer?: JourneyRoute;
  fragment?: string;
}
