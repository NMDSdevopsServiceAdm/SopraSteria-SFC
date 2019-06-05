export interface WorkplaceService {
  id: number;
  isCQC: boolean;
  name: string;
  other?: boolean;
  otherName?: string;
}

export interface WorkplaceCategory {
  category: string;
  services: Array<WorkplaceService>;
}
