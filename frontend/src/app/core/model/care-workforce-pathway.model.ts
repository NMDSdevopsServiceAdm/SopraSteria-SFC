export type CareWorkforcePathwayUse = YES | NO | DONT_KNOW | null;
export type UpdateCareWorkforcePathwayUsePayload = YES | NO | DONT_KNOW;
export interface CareWorkforcePathwayUseReason {
  id: number;
  text: string;
  isOther: boolean;
  other?: string;
}

type YES = {
  use: 'Yes';
  reasons: Array<CareWorkforcePathwayUseReason> | null;
};

type NO = {
  use: 'No';
  reasons: null;
};

type DONT_KNOW = {
  use: "Don't know";
  reasons: null;
};
