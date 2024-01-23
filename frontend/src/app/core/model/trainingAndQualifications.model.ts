import { QualificationsByGroup } from './qualification.model';
import { TrainingRecords } from './training.model';

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
