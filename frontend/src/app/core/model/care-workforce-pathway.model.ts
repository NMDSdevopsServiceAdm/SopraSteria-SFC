export interface CareWorkforcePathwayUseReason {
  id: number;
  text: string;
  isOther: boolean;
  other?: string;
}

type YES = {
  use: 'Yes';
  reasons: Pick<CareWorkforcePathwayUseReason, 'id' | 'other'>[] | null;
};

type NO = {
  use: 'No';
  reasons: null;
};

type DONT_KNOW = {
  use: "Don't know";
  reasons: null;
};

export type CareWorkforcePathwayUse = YES | NO | DONT_KNOW;
