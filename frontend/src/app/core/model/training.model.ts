import { Certificate, CertificateDownload } from './trainingAndQualifications.model';

export interface TrainingCategory {
  id: number;
  seq: number;
  category: string;
  trainingCategoryGroup: string;
}

export interface TrainingCategoryResponse {
  trainingCategories: TrainingCategory[];
}

export interface SelectedTraining extends Omit<TrainingRecordRequest, 'trainingCategory'> {
  trainingCategory: TrainingCategory;
}

export interface TrainingRecordRequest {
  trainingCategory: {
    id: number;
  };
  title: string;
  accredited?: string;
  completed?: string;
  expires?: string;
  notes?: string;
}

export interface CreateTrainingRecordResponse extends TrainingRecordRequest {
  uid: string;
  workerUid: string;
  created: string;
}

export interface TrainingResponse {
  count: number;
  lastUpdated?: string;
  training: TrainingRecord[];
}

export interface TrainingCertificateDownloadEvent {
  recordType: 'training';
  recordUid: string;
  categoryName: string;
  filesToDownload: CertificateDownload[];
}

export interface TrainingCertificateUploadEvent {
  recordType: 'training';
  recordUid: string;
  categoryName: string;
  files: File[];
}

export interface TrainingCertificate extends Certificate {}

export interface TrainingRecord {
  accredited?: boolean;
  trainingCategory: {
    id: number;
    category: string;
  };
  trainingCertificates: TrainingCertificate[];
  completed?: Date;
  created: Date;
  expires?: Date;
  notes?: string;
  title: string;
  uid: string;
  updated: Date;
  updatedBy: string;
  trainingStatus?: number;
  missing?: boolean;
}

export interface TrainingRecordCategory {
  category: string;
  id: number;
  trainingRecords: TrainingRecord[];
}

export interface TrainingRecords {
  mandatory: TrainingRecordCategory[];
  nonMandatory: TrainingRecordCategory[];
  lastUpdated?: Date;
  jobRoleMandatoryTrainingCount: MandatoryTraining[];
}

export interface MandatoryTraining {
  id: number;
  category: string;
}

export interface mandatoryJobs {
  id: number;
}

export interface mandatoryTraining {
  trainingCategoryId: number;
  allJobRoles?: boolean;
  selectedJobRoles?: boolean;
  category?: string;
  jobs: mandatoryJobs[];
}
export interface allMandatoryTrainingCategories {
  mandatoryTrainingCount: number;
  allJobRolesCount: number;
  mandatoryTraining: mandatoryTraining[];
}
export interface MultipleTrainingResponse {
  savedRecords: number;
}

export interface Training {
  id: number;
  uid?: string;
  title?: string;
  expires?: Date;
  missing?: boolean;
  worker: {
    id: number;
    uid: string;
    NameOrIdValue: string;
    mainJob: {
      id: number;
      title: string;
    };
  };
}

export interface TrainingRecordCategories {
  id: number;
  seq: number;
  category: string;
  training: Training[];
  isMandatory: boolean;
}

export enum DeliveredBy {
  InHouseStaff = 'In-house staff',
  ExternalProvider = 'External provider',
}

export enum HowWasItDelivered {
  FaceToFace = 'Face to face',
  ELearning = 'E-learning',
}
