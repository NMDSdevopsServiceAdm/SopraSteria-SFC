export interface WDFReport {
  establishmentId: number;
  timestamp: Date;
  effectiveFrom: Date;
  wdf: {
    overallWdfEligibility?: Date;
    isEligible: boolean;
    workplace: boolean;
    staff: boolean;
  };
  customEffectiveFrom: boolean;
}
