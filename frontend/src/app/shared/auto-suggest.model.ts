import { Job } from '@core/model/job.model';

export interface AutoSuggestResult<T> {
  suggestion: string;
  dataValue: T;
}

export type AutoSuggestDataProvider<T> = (searchTerm: string) => Array<AutoSuggestResult<T>>;

export type JobRoleDataProvider = AutoSuggestDataProvider<Job>;
