export interface WDFReport {
  establishmentId: string;
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
