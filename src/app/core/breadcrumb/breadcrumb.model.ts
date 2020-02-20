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
}

export interface JourneyRoute {
  title?: string;
  path?: string;
  children?: JourneyRoute[];
  referrer?: JourneyRoute;
  fragment?: string;
}
