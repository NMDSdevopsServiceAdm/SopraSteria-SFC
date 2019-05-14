export interface LoggedInMainService {
  id: number;
  name: string;
}

export interface LoggedInEstablishment {
  id: number;
  name: string;
  isRegulated: boolean;
  nmdsId: string;
}

export interface LoggedInSession {
  establishment: LoggedInEstablishment;
  expiryDate: string;
  fullname: string;
  isFirstLogin: boolean;
  isPrimary: boolean;
  lastLoggedIn: string;
  mainService: LoggedInMainService;
  role: string;
}
