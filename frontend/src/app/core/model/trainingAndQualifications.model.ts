import {
  QualificationsByGroup,
  QualificationCertificateDownloadEvent,
  QualificationCertificateUploadEvent,
} from './qualification.model';
import {
  TrainingRecords,
  TrainingCertificateDownloadEvent,
  TrainingCertificateUploadEvent,
  TrainingRecord,
} from './training.model';

export interface TrainingAndQualificationRecords {
  qualifications: QualificationsByGroup;
  training: TrainingRecords;
}

export interface TrainingCounts {
  totalTraining?: number;
  totalRecords?: number;
  totalExpiredTraining?: number;
  totalExpiringTraining?: number;
  missingMandatoryTraining?: number;
  staffMissingMandatoryTraining?: number;
}

export interface Certificate {
  uid: string;
  filename: string;
  uploadDate: string;
}

export interface CertificateDownload {
  uid: string;
  filename: string;
}

export type CertificateDownloadEvent = TrainingCertificateDownloadEvent | QualificationCertificateDownloadEvent;

export type CertificateUploadEvent = TrainingCertificateUploadEvent | QualificationCertificateUploadEvent;

export interface UploadCertificateSignedUrlRequest {
  files: { filename: string }[];
}

export interface UploadCertificateSignedUrlResponse {
  files: { filename: string; fileId: string; signedUrl: string; key: string }[];
}

export interface DownloadCertificateSignedUrlResponse {
  files: { filename: string; signedUrl: string }[];
}

export interface S3UploadResponse {
  headers: { etag: string };
}
export interface FileInfoWithETag {
  filename: string;
  fileId: string;
  etag: string;
  key: string;
}

export interface ConfirmUploadRequest {
  files: { filename: string; fileId: string; etag: string }[];
}

export type ActionsListItem = TrainingRecord & { typeOfTraining: string };
export type ActionsListData = Array<ActionsListItem>;
