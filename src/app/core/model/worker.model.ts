import { Contracts } from './contracts.enum';
import { JobRole } from './job.model';

export interface Worker {
  uid?: string;
  nameOrId: string;
  contract: Contracts;
  mainJob: JobRole;
  localIdentifier: string;
  approvedMentalHealthWorker?: string;
  otherJobs?: JobRole[];
  mainJobStartDate?: string;
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
  daysSick?: {
    value: number;
    days?: number;
  };
  zeroHoursContract: string;
  weeklyHoursAverage: {
    value: string;
    hours: number;
  };
  weeklyHoursContracted: {
    value: string;
    hours: number;
  };
  annualHourlyPay: {
    value: string;
    rate: number;
  };
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
  created?: string;
  updated?: string;
  completed?: boolean;
}

export interface WorkersResponse {
  workers: Worker[];
}

export interface WorkerEditResponse {
  uid: string;
}
