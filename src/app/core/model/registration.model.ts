import { WorkplaceLocation } from '@core/model/workplace-location.model';

export interface RegistrationModel {
  success: number;
  message: string;
  // TODO to remove
  userRoute: {
    currentPage: number;
    route: [];
  };
  locationdata: Array<WorkplaceLocation>;
  postcodedata: Array<WorkplaceLocation>;
}
