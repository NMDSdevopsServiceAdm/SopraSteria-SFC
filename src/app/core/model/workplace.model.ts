export interface Workplace {
  id: number;
  isCQC: boolean;
  name: string;
  other?: boolean;
  otherName?: string;
}

export interface WorkplaceCategory {
  category: string;
  services: Array<Workplace>;
}
