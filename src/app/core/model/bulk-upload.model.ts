export enum ValidateStatus {
  Failed = 'Failed',
  In_Progress = 'In progress',
  Passed = 'Passed',
}


export interface PresignedUrlResponse {
  urls: string;
}

export interface UploadFile extends File {
  extension: string;
  status?: ValidateStatus;
}

export interface ValidatedFilesResponse {
  establishments: ValidatedFile;
  training: ValidatedFile;
  workers: ValidatedFile;
}

export interface ValidatedFile {
  errors: number;
  filename: string;
  records: number;
  warnings: number;
}
