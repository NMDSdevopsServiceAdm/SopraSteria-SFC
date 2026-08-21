export interface NurseFieldOfPractice {
  id: number;
  label: string;
}

export interface GetAllNurseFieldsOfPracticeResponse {
  allNurseFieldsOfPractice: NurseFieldOfPractice[];
}

export const RegisteredNurseJobRoleId = 23;

export interface RegisteredNurse {
  nameOrId: string;
  uid: string;
  nurseFieldOfPractice: NurseFieldOfPractice[];
}

export interface GetAllRegisteredNursesResponse {
  registeredNurses: RegisteredNurse[];
}
