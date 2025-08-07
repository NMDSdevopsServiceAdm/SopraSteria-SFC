export interface GetDelegatedHealthcareActivitiesResponse {
  allDHAs: DelegatedHealthcareActivity[];
}

export interface DelegatedHealthcareActivity {
  id: number;
  title: string;
  description: string;
}
