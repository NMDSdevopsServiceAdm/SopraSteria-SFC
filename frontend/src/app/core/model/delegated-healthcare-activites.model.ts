export interface DelegatedHealthcareActivity {
  id: number;
  seq: number;
  title: string;
  description: string;
}

export interface DelegatedHealthcareActivitiesResponse {
  allDHAs: DelegatedHealthcareActivity[];
}
