export interface WDFLockStatus {
  establishmentId: number;
  WdfReportState: string;
  WdfReportLockHeld: boolean;
}

export enum Eligibility {
  YES = 'Yes',
  NO = 'No',
  NOT_RELEVANT = 'Not relevant',
}

export interface WDFValue {
  isEligible: Eligibility;
  updatedSinceEffectiveDate: boolean;
}
