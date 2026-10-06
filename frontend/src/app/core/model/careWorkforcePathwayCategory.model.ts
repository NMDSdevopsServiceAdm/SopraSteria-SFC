export interface CareWorkforcePathwayRoleCategory {
  id: number;
  title: string;
  description: string;
  group: string;
  isAlsoNominatedIndividual: boolean;
}

export interface CareWorkforcePathwayRoleCategoryResponse {
  careWorkforcePathwayRoleCategories: CareWorkforcePathwayRoleCategory[];
}
