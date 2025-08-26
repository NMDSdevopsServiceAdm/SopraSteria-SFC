import { JobRole } from './job.model';

export interface GetDelegatedHealthcareActivitiesResponse {
  allDHAs: DelegatedHealthcareActivity[];
}

export interface DelegatedHealthcareActivity {
  id: number;
  title: string;
  description: string;
}

export interface StaffKindDelegatedHealthcareActivity {
  id: number;
}

export type StaffWhatKindDelegatedHealthcareActivities = YES | DONT_KNOW | null;
export type UpdateStaffKindDelegatedHealthcareActivitiesPayload = YES | DONT_KNOW | null;

type YES = {
  knowWhatActivities: 'Yes';
  activities: Array<StaffKindDelegatedHealthcareActivity> | null;
};

type DONT_KNOW = {
  knowWhatActivities: "Don't know";
  activities: null;
};

export type DHAGetNumberOfWorkersResponse = {
  noOfWorkersWhoRequiresAnswer: number;
};

export type DHAGetAllWorkersResponse = {
  workers: { uid: string; nameOrId: string; mainJob: JobRole }[];
  workerCount: number;
};
