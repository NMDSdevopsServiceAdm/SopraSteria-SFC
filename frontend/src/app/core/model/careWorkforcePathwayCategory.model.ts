export interface CareWorkforcePathwayCategory {
  id: number;
  title: string;
  description: string;
}

export interface CareWorkforcePathwayResponse {
  careWorkforcePathwayCategories: CareWorkforcePathwayCategory[];
}
