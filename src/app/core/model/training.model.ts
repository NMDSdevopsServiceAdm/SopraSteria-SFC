export interface TrainingCategory {
  id: number;
  seq: number;
  category: string;
}

export interface TrainingCategoryResponse {
  trainingCategories: TrainingCategory[];
}

export interface TrainingRecordRequest {
  trainingCategory: {
    id: number;
  };
  title: string;
  accredited?: boolean;
  completed?: string;
  expires?: string;
  notes?: string;
}

export interface TrainingResponse {
  count: number;
  lastUpdated?: string;
  training: TrainingRecord[];
}

export interface TrainingRecord {
  accredited?: boolean;
  trainingCategory: {
    id: number;
    category: string;
  };
  completed?: string;
  created: string;
  expires?: string;
  notes?: string;
  title: string;
  uid: string;
  updated: string;
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
}

export interface MultipleTrainingResponse {
  savedRecords: number;
}
