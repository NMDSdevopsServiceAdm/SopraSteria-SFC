export interface BulkUploadStatus {
  establishmentId: string;
  bulkUploadState: string;
  bulkUploadLockHeld: boolean;
}

export interface BulkUploadLock {
  message: string;
  requestId: string;
}

export enum FileValidateStatus {
  Fail = 'Fail',
  Validating = 'Validating...',
  Pass = 'Pass',
}

export enum BulkUploadFileType {
  Establishment = 'Workplace',
  Training = 'Training',
  Worker = 'Staff',
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

export interface ValidatedFilesResponse {
  establishment: ValidatedFile;
  training: ValidatedFile;
  workers: ValidatedFile;
}

export interface UploadedFilesResponse {
  establishment: {
    uid: number;
  };
  files: ValidatedFile[];
}

export interface UploadedFilesRequestToDownloadResponse {
  file: {
    filename: string;
    uploaded: Date;
    username: string;
    size: number;
    key: string;
    signedUrl: string;
  };
}

export interface ValidatedFile {
  errors: number;
  filename: string;
  fileType: ValidatedFileType;
  key: string;
  records: number;
  size: number;
  uploaded: string;
  status?: FileValidateStatus;
  warnings: number;
  username: string;
  deleted?: number;
}
export interface ErrorReportError {
  origin: string;
  lineNumber: number;
  errCode: number;
  errType: string;
  source: string;
  name: string;
  error: string;
}

export interface ErrorReportWarning {
  origin: string;
  lineNumber: number;
  warnCode: number;
  warnType: string;
  source: string;
  name: string;
  warning: string;
}
export interface ErrorReportErrorsWarnings {
  errors: ErrorReportError[];
  warnings: ErrorReportWarning[];
}
export interface ErrorReport {
  establishments: ErrorReportErrorsWarnings;
  workers: ErrorReportErrorsWarnings;
  training: ErrorReportErrorsWarnings;
}

export interface NumberOfErrorsAndWarnings {
  establishments: {
    errors: number;
    warnings: number;
  };
  workers: {
    errors: number;
    warnings: number;
  };
  training: {
    errors: number;
    warnings: number;
  };
}

export type ValidatedFileType = 'Establishment' | 'Training' | 'Worker';

export type ReportTypeRequestItem = 'establishments' | 'training' | 'workers';
