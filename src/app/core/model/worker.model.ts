import { Contracts } from '../constants/contracts.enum';
import { Job } from './job.model';

export interface Worker {
  uid?: string;
  nameOrId: string;
  contract: Contracts;
  mainJob: Job;
  approvedMentalHealthWorker?: string;
  otherJobs?: Job[];
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
  careCertificate: string;
}
