export interface WorkplaceService {
  id: number;
  isCQC: boolean;
  name: string;
  other?: boolean;
  otherWorkplaceService?: string;
}
