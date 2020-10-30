import { Contracts } from './contracts.enum';
import { JobRole } from './job.model';
import { NurseSpecialism } from './nurse-specialism.model';
import { WDFValue } from './wdf.model';

export interface Worker {
  trainingAlert?: number;
  uid?: string;
  ustatus?: string;
  nameOrId: string;
  contract: Contracts;
  mainJob: JobRole;
  localIdentifier: string;
  approvedMentalHealthWorker?: string;
  otherJobs?: {
    value: string;
    jobs: JobRole[];
  };
  mainJobStartDate?: string;
  fluJab?: string;
  nationalInsuranceNumber?: string;
  dateOfBirth?: string;
  postcode?: string;
  gender?: string;
  disability?: string;
  ethnicity?: {
    ethnicityId: number;
    ethnicity?: string;
  };
  nationality?: {
    value: string;
    other?: {
      nationalityId?: number;
      nationality?: string;
    };
  };
  recruitedFrom?: {
    value: string;
    from?: {
      recruitedFromId: number;
      from?: string;
    };
  };
  britishCitizenship?: string;
  countryOfBirth?: {
    value: string;
    other?: {
      countryId?: number;
      country?: string;
    };
  };
  yearArrived?: {
    value: string;
    year: number;
  };
  socialCareStartDate?: {
    value: string;
    year: number;
  };
  daysSick?: WorkerDays;
  zeroHoursContract: string;
  weeklyHoursAverage: {
    value: string;
    hours: number;
  };
  weeklyHoursContracted: {
    value: string;
    hours: number;
  };
  annualHourlyPay: WorkerPay;
  careCertificate: string;
  apprenticeshipTraining: string;
  qualificationInSocialCare: string;
  socialCareQualification: {
    qualificationId: number;
    title?: string;
  };
  otherQualification: string;
  highestQualification: {
    qualificationId: number;
    title?: string;
  };
  registeredNurse: string;
  nurseSpecialism: {
    specialism: string;
  };
  nurseSpecialisms?: {
    value: string;
    specialisms: NurseSpecialism[];
  };
  created?: string;
  updated?: string;
  completed?: boolean;
  wdf?: WorkerWdfRecord;
  wdfEligible: boolean;
  jobRole?: string;
  trainingCount: number;
  trainingLastUpdated?: string;
  expiredTrainingCount: number;
  expiringTrainingCount: number;
  missingMandatoryTrainingCount: number;
  qualificationCount: number;
}

export interface WorkerPay {
  value: string;
  rate: number;
}

export interface WorkerDays {
  value: number;
  days?: number;
}

export interface WorkerWdfRecord {
  annualHourlyPay: WDFValue;
  careCertificate: WDFValue;
  contract: WDFValue;
  currentEligibility: boolean;
  dateOfBirth: WDFValue;
  daysSick: WDFValue;
  effectiveFrom: string;
  gender: WDFValue;
  highestQualification: WDFValue;
  isEligible: boolean;
  lastEligibility: string;
  mainJob: WDFValue;
  mainJobStartDate: WDFValue;
  nationality: WDFValue;
  otherQualification: WDFValue;
  qualificationInSocialCare: WDFValue;
  recruitedFrom: WDFValue;
  socialCareQualification: WDFValue;
  weeklyHoursAverage: WDFValue;
  weeklyHoursContracted: WDFValue;
  zeroHoursContract: WDFValue;
}

export interface WorkersResponse {
  workers: Worker[];
}

export interface WorkerEditResponse {
  uid: string;
}

export enum SelectRecordTypes {
  Training = 'Training course',
  Qualification = 'Qualification',
}
