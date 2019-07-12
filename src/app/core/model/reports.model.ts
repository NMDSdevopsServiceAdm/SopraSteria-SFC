export interface WDFReport {
  establishmentId: number;
  timestamp: string;
  effectiveFrom: string;
  wdf: {
    overallWdfEligibility?: string;
    isEligible: boolean;
    workplace: boolean;
    staff: boolean;
  };
  customEffectiveFrom: boolean;
}
