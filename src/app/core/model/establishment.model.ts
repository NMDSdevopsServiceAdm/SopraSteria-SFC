import { DataPermissions, WorkplaceDataOwner } from './my-workplaces.model';
import { WDFValue } from './wdf.model';

export interface MainService {
  id: number;
  name: string;
  isCQC: boolean;
  other?: boolean;
  otherName?: string;
}

export interface ServiceUser {
  id: number;
  group: string;
  service: string;
  other?: string;
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
  employerType: WDFValue;
  mainService: WDFValue;
  capacities: WDFValue;
  serviceUsers: WDFValue;
  vacancies: WDFValue;
  starters: WDFValue;
  leavers: WDFValue;
  numberOfStaff: WDFValue;
}

export interface Establishment {
  id: number;
  uid: string;
  ownerChangeRequestUID?: string;
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
  employerType: {
    value: string;
    other: string;
  };
  numberOfStaff: number;
  totalWorkers: number;
  otherServices: any[];
  serviceUsers: ServiceUser[];
  capacities: Capacity[];
  share: Share;
  localAuthorities: LocalAuthority[];
  primaryAuthority: PrimaryAuthority;
  parentPermissions?: string;
  vacancies: Vacancy[] | string;
  totalVacancies: number;
  starters: Starter[] | string;
  totalStarters: number;
  leavers: Leaver[] | string;
  totalLeavers: number;
  wdf?: WDF;
  isParent?: boolean;
  parentName?: string;
  dataOwner: WorkplaceDataOwner;
  dataPermissions: DataPermissions;
  dataOwnershipRequested: string;
  ownershipChangeRequestId?: string;
}

export interface UpdateJobsRequest {
  leavers?: Leaver[] | string;
  starters?: Starter[] | string;
  vacancies?: Vacancy[] | string;
}

export enum jobOptionsEnum {
  // tslint:disable-next-line: quotemark
  DONT_KNOW = "Don't know",
  NONE = 'None',
}

export interface LocalIdentifiersRequest {
  localIdentifiers: LocalIdentifier[];
}

export interface LocalIdentifiersResponse {
  id: number;
  localIdentifiers: { uid: string; value: string };
  name: string;
  uid: string;
  updated: string;
  updatedBy: string;
}

export interface LocalIdentifier {
  uid: string;
  value: string;
}

export interface ChangeOwner {
  permissionRequest: string;
}

export interface CancelOwnerShip {
  approvalStatus: string;
}
