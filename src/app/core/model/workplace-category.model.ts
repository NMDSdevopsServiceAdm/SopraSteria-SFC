import { WorkplaceService } from '@core/model/workplace-service.model';

export interface WorkPlaceCategory {
  category: string;
  services: Array<WorkplaceService>;
}

