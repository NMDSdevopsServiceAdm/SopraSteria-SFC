export interface CareWorkforcePathwayRoleCategory {
  id: number;
  title: string;
  description: string;
  group: CWPRoleCategoryGroup;
  isNominatedIndividual?: boolean;
}

export enum CWPRoleCategoryGroup {
  CareProviding = 'Care Providing',
  SeniorLeadership = 'Senior leadership',
  NonCareProviding = 'Non-care providing',
  Others = 'others',
}

export interface CareWorkforcePathwayRoleCategoryResponse {
  careWorkforcePathwayRoleCategories: CareWorkforcePathwayRoleCategory[];
}
