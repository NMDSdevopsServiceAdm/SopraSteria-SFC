import { Service } from '@core/model/services.model';

export interface WorkplaceCategory {
  category: string;
  services: Array<Service>;
}
