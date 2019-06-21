export enum FileValidateStatus {
  Fail = 'Fail',
  Validating = 'Validating...',
  Pass = 'Pass',
}

export interface PresignedUrlRequestItem {
  filename: string;
}

export interface PresignedUrlResponseItem extends PresignedUrlRequestItem {
  signedUrl: string;
}

export interface PresignedUrlsRequest {
  files: PresignedUrlRequestItem[];
}

export interface UploadFileRequestItem {
  file: File;
  signedUrl: string;
}

export interface UploadedFile {
  name: string;
  errors?: number;
  fileType?: string;
  records?: number;
  status?: FileValidateStatus;
  warnings?: number;
}

export interface ValidatedFilesResponse {
  establishment: ValidatedFile;
  training: ValidatedFile;
  workers: ValidatedFile;
}

export interface ValidatedFile {
  errors: number;
  filename: string;
  fileType: string;
  records: number;
  warnings: number;
}
