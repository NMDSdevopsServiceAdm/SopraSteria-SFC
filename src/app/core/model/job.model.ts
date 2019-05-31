export interface Job {
  jobId: number;
  id?: number;
  title?: string;
  other?: boolean;
}

export interface JobRole {
  jobId: number;
  title?: string;
  other?: string;
}
