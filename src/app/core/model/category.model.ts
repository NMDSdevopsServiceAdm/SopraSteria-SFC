import { Service } from '@core/model/service.model';

export interface Category {
  category: string;
  services: Array<Service>;
}

