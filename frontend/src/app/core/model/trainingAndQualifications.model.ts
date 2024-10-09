import { QualificationsByGroup, QualificationCertificate } from './qualification.model';
import { TrainingRecords, TrainingCertificate } from './training.model';

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

export type Certificate = TrainingCertificate | QualificationCertificate;
