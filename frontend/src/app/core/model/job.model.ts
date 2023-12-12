export interface Job {
  id: number;
  title?: string;
  other?: boolean;
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
