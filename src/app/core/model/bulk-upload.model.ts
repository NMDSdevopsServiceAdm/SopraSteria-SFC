export enum FileValidateStatus {
  Fail = 'Fail',
  Validating = 'Validating...',
  Pass = 'Pass',
}

export interface PresignedUrlResponse {
  urls: string;
}

export interface UploadFile extends File {
  extension: string;
  status?: FileValidateStatus;
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
