export interface DelegatedHealthcareActivity {
  id: number;
  seq: number;
  title: string;
  description: string;
}

export interface DelegatedHealthcareActivitiesResponse {
  allDHAs: DelegatedHealthcareActivity[];
}

export interface StaffKindDelegatedHealthcareActivity {
  id: number;
}

export type StaffWhatKindDelegatedHealthcareActivities = YES | DONT_KNOW | null;
export type UpdateStaffKindDelegatedHealthcareActivitiesPayload = YES | DONT_KNOW;

type YES = {
  whatDelegateHealthcareActivities: 'Yes';
  activities: Array<StaffKindDelegatedHealthcareActivity> | null;
};

type DONT_KNOW = {
  whatDelegateHealthcareActivities: "Don't know";
  activities: null;
};
