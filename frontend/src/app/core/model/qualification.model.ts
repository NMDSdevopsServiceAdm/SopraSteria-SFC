export enum QualificationType {
  NVQ = 'NVQ',
  Other = 'Other type of qualification',
  Certificate = 'Certificate',
  Degree = 'Degree',
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

export interface QualificationsByGroup {
  count: number;
  lastUpdated: Date;
  groups: QualificationGroup[];
}

export interface QualificationGroup {
  group: string;
  records: BasicQualificationRecord[];
}

export interface BasicQualificationRecord {
  notes: string;
  title: string;
  uid: string;
  year: number;
}
