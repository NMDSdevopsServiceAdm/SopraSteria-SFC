export enum QualificationType {
  NVQ = 'NVQ',
  Other = 'Any other qualification',
  Certificate = 'Certificate',
  Degree = 'Degree',
  Assessor = 'Assessor and mentoring',
  Award = 'Award',
  Diploma = 'Diploma',
  Apprenticeship = 'Apprenticeship',
}

export interface QualificationLevel {
  id: number;
  level: string;
}

export interface AvailableQualificationsResponse {
  count: number;
  type: QualificationType;
  qualifications: {
    id: number;
    code: number;
    from?: string;
    level: string;
    title: string;
  }[];
}

export interface QualificationRequest {
  type: QualificationType;
  qualification: Qualification;
  year?: 2014;
  notes?: string;
}

export interface QualificationsResponse {
  count: number;
  lastUpdated?: string;
  qualifications: Qualification[];
}

export interface QualificationResponse {
  uid: string;
  created: string;
  updated: string;
  updatedBy: string;
  qualification: Qualification;
  year: number;
  notes: string;
}

export interface Qualification {
  id: number;
  uid?: string;
  code?: number;
  from?: string;
  until?: string;
  level?: string;
  title?: string;
  group?: string;
  year?: number;
  notes?: string;
  qualification?: {
    title?: string;
    group?: string;
  };
}
