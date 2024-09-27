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

export interface CertificateDownload {
  uid: string;
  filename: string;
}

export interface TrainingCertificate {
  uid: string;
  filename: string;
  uploadDate: string;
}

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
  allJobRoles: boolean;
  selectedJobRoles?: boolean;
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
