export interface CareWorkforcePathwayWorkplaceAwarenessAnswer {
  id: number;
  title: string;
}

export interface CareWorkforcePathwayWorkplaceAwarenessResponse {
  careWorkforcePathwayWorkplaceAwarenessAnswers: CareWorkforcePathwayWorkplaceAwarenessAnswer[]
}

export interface CareWorkforcePathwayUseReason {
  id: number;
  text: string;
  isOther: boolean;
  other?: string;
}

export type CareWorkforcePathwayUse = YES | NO | DONT_KNOW | null;
export type UpdateCareWorkforcePathwayUsePayload = YES | NO | DONT_KNOW;

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
