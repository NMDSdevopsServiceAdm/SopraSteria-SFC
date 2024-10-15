import {
  QualificationsByGroup,
  QualificationCertificateDownloadEvent,
  QualificationCertificateUploadEvent,
} from './qualification.model';
import { TrainingRecords, TrainingCertificateDownloadEvent, TrainingCertificateUploadEvent } from './training.model';

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
