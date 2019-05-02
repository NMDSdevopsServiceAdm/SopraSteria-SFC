import { WorkplaceService } from '@core/model/workplace-service.model';

export interface WorkplaceCategory {
  category: string;
  services: Array<WorkplaceService>;
}
