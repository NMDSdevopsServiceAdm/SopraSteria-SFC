export interface WDFFailureReason {
  [type: string]: {
    message: string;
    code: number;
  };
}

export interface WDFReport {
  establishmentId: number;
  timestamp: string;
  effectiveFrom: string;
  wdf: {
    overallWdfEligibility?: string;
    establishmentElibigility?: string;
    staffEligibility?: string;
    overall: boolean;
    workplace: boolean;
    staff: boolean;
    reasons?: WDFFailureReason[];
  };
  customEffectiveFrom: boolean;
}
