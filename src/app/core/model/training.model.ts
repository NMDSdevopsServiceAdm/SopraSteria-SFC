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
  accredited: boolean;
  completed: string;
  expires: string;
  notes: string;
}
