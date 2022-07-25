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

export interface ShareWith {
  cqc: boolean;
  localAuthorities: boolean;
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
  title?: string;
  total: number;
}

export interface Starter {
  jobId: number;
  title?: string;
  total: number;
}

export interface Leaver {
  jobId: number;
  title?: string;
  total: number;
}

export interface Category {
  trainingId: number;
  title: string;
}

export interface BannerFlag {
  property: string;
  value: boolean;
}

export interface WDF {
  effectiveFrom: Date;
  overalWdfEligible: boolean;
  lastEligibility: Date; // date establishment was last eligible
  isEligible: boolean; //  are both the establishment & workers eligible?
  currentEligibility: boolean; //  is the establishment currently eligible?
  canConfirm: boolean; // can the establishment confirm their details are up-to-date?
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
  parentUid?: string;
  createdByUserUID?: string;
  id: number;
  uid: string;
  ustatus?: string;
  ownerChangeRequestUID?: any;
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
  otherServices: {
    value: string;
    services: any[];
  };
  serviceUsers: ServiceUser[];
  capacities: Capacity[];
  shareWith: ShareWith;
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
  linkToParentRequested?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  town?: string;
  county?: string;
  locationId?: string;
  lastBulkUploaded?: string;
  eightWeeksFromFirstLogin?: string;
  showSharingPermissionsBanner?: boolean;
  recruitmentJourneyExistingUserBanner?: boolean;
  doNewStartersRepeatMandatoryTrainingFromPreviousEmployment?: string;
  moneySpentOnAdvertisingInTheLastFourWeeks?: string;
  wouldYouAcceptCareCertificatesFromPreviousEmployment?: string;
  peopleInterviewedInTheLastFourWeeks?: string;
  showAddWorkplaceDetailsBanner?: boolean;
}

export interface UpdateJobsRequest {
  leavers?: Leaver[] | string;
  starters?: Starter[] | string;
  vacancies?: Vacancy[] | string;
  categories?: Category[] | string;
}

export enum jobOptionsEnum {
  DONT_KNOW = "Don't know",
  NONE = 'None',
}

export enum staffRecruitmentOptionsEnum {
  ALWAYS = 'Yes, always',
  VERY_OFTEN = 'Yes, very often',
  NOT_OFTEN = 'Yes, but not very often',
  NEVER = 'No, never',
}

export enum mandatoryTrainingJobOption {
  all = 'all',
  selected = 'selected',
}

export enum StaffBenefitEnum {
  YES = 'Yes',
  NO = 'NO',
  DONT_KNOW = "Don't know",
}

export interface StaffRecruitmentDataRequest {
  amountSpent?: string;
  numberOfInterviews?: string;
  trainingRequired?: string;
  acceptCareCertificatesFromPreviousEmployment?: string;
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

export interface setPermission {
  permissionToSet: string;
}

export interface mandatoryJobs {
  id: number;
}

export interface mandatoryTraining {
  trainingCategoryId: number;
  allJobRoles: boolean;
  selectedJobRoles?: boolean;
  jobs: mandatoryJobs[];
}

export interface allMandatoryTrainingCategories {
  mandatoryTrainingCount: number;
  allJobRolesCount: number;
  mandatoryTraining: mandatoryTraining[];
}
export interface mandatoryTrainingCategories {
  categories: mandatoryTraining[];
}
export interface adminMoveWorkplace {
  parentUid: string;
  subUid: string;
}

export enum SortStaffOptions {
  '0_asc' = 'Staff name (A to Z)',
  '0_dsc' = 'Staff name (Z to A)',
  '1_asc' = 'Job role (A to Z)',
  '1_dsc' = 'Job role (Z to A)',
}

export enum WdfSortStaffOptions {
  '0_asc' = 'Staff name (A to Z)',
  '0_dsc' = 'Staff name (Z to A)',
  '1_asc' = 'Job role (A to Z)',
  '1_dsc' = 'Job role (Z to A)',
  '2_meeting' = 'WDF requirements (meeting)',
  '2_not_meeting' = 'WDF requirements (not meeting)',
}

export enum WdfParentSortWorkplacesOptions {
  '1_not_meeting' = 'WDF requirements (not meeting)',
  '2_meeting' = 'WDF requirements (meeting)',
  '3_asc' = 'Workplace name (A to Z)',
  '4_dsc' = 'Workplace name (Z to A)',
}

export enum SortTrainingAndQualsOptionsWorker {
  '0_expired' = 'Expired',
  '1_expires_soon' = 'Expires soon',
  '2_missing' = 'Missing',
  '3_worker' = 'Staff name',
}
export enum SortTrainingAndQualsOptionsCat {
  '0_expired' = 'Expired',
  '1_expires_soon' = 'Expires soon',
  '2_missing' = 'Missing',
  '3_category' = 'Category',
}

export enum FilterTrainingAndQualsOptions {
  '0_showall' = 'Show all',
  '1_expired' = 'Expired',
  '2_expires_soon' = 'Expires soon',
}
