export interface Job {
  id: number;
  title?: string;
  other?: boolean;
  jobRoleGroup?: string;
  canDoDelegatedHealthcareActivities?: boolean;
}

export interface JobGroup {
  title: string;
  descriptionText: string;
  items: { label: string; id: number }[];
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
