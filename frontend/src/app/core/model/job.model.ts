export interface Job {
  id: number;
  title?: string;
  other?: boolean;
  jobRoleGroup?: string;
}

export interface JobGroup {
  title: string;
  descriptionText: string;
  items: Job[];
}

export interface GetJobsResponse {
  jobs: Job[];
}

export interface JobRole {
  jobId: number;
  jobRoleName?: string;
  title?: string;
  other?: string;
}

export interface GetJobsResponse {
  jobs: Job[];
}
