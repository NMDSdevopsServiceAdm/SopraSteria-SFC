import { Roles } from '@core/model/roles.enum';

export interface LoggedInMainService {
  id: number;
  name: string;
}

export interface LoggedInEstablishment {
  id: number;
  isFirstBulkUpload: boolean;
  isParent: boolean;
  isRegulated: boolean;
  name: string;
  nmdsId: string;
  parentName: string;
}

export interface LoggedInSession {
  establishment: LoggedInEstablishment;
  expiryDate: string;
  fullname: string;
  isFirstLogin: boolean;
  isPrimary: boolean;
  lastLoggedIn: string;
  mainService: LoggedInMainService;
  role: Roles;
}
