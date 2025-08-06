export interface DelegatedHealthcareActivity {
  id: number;
  seq: number;
  title: string
  description: string
  analysisFileCode: number;
  bulkUploadCode: number;
}

export interface DelegatedHealthcareActivitiesResponse {
  allDHAs: DelegatedHealthcareActivity[];
}
