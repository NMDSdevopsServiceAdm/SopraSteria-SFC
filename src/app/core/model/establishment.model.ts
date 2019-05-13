export interface MainService {
  id: number;
  name: string;
}

export interface ServiceUser {
  id: number;
  group: string;
  service: string;
}

export interface Capacity {
  question: string;
  questionId: number;
  seq: number;
  answer: number;
}

export interface Share {
  enabled: boolean;
  with: string[];
}

export interface LocalAuthority {
  id: number;
  custodianCode: number;
  name: string;
  isPrimaryAuthority?: boolean;
}

export interface PrimaryAuthority {
  custodianCode: number;
  name: string;
}

export interface Vacancy {
  jobId: number;
  title: string;
  total: number;
}

export interface Starter {
  jobId: number;
  title: string;
  total: number;
}

export interface Leaver {
  jobId: number;
  title: string;
  total: number;
}

export interface WDF {
  effectiveFrom: Date;
  overalWdfEligible: boolean;
  lastEligibility: Date;
  isEligible: boolean;
  currentEligibility: boolean;
  employerType: string;
  mainService: string;
  otherService: string;
  capacities: string;
  serviceUsers: string;
  vacancies: string;
  starters: string;
  leavers: string;
}

export interface Establishment {
  id: number;
  uid: string;
  name: string;
  address: string;
  postcode: string;
  locationRef?: any;
  isRegulated: boolean;
  nmdsId: string;
  created: Date;
  updated: Date;
  updatedBy: string;
  mainService: MainService;
  employerType: string;
  numberOfStaff: number;
  otherServices: any[];
  serviceUsers: ServiceUser[];
  capacities: Capacity[];
  share: Share;
  localAuthorities: LocalAuthority[];
  primaryAuthority: PrimaryAuthority;
  Vacancies: Vacancy[];
  TotalVacencies: number;
  Starters: Starter[];
  TotalStarters: number;
  Leavers: Leaver[];
  TotalLeavers: number;
  wdf: WDF;
}
