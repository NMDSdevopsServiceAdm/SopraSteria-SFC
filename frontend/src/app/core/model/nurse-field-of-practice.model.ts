export interface NurseFieldOfPractice {
  id: number;
  label: string;
}

export interface GetAllNurseFieldsOfPracticeResponse {
  allNurseFieldsOfPractice: NurseFieldOfPractice[];
}
