import { QualificationsByGroup } from './qualification.model';
import { TrainingRecords } from './training.model';

export interface TrainingAndQualificationRecords {
  qualifications: QualificationsByGroup;
  training: TrainingRecords;
}
