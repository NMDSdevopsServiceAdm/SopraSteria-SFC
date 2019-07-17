import { Roles } from '@core/model/roles.enum';

export interface LoggedInMainService {
  id: number;
  name: string;
}

export interface LoggedInEstablishment {
  id: number;
  name: string;
  isRegulated: boolean;
  nmdsId: string;
  isParent: boolean;
  parentName: string;
  isFirstBulkUpload: boolean;
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
  uid: string;
}
