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
  fullname: string;
  isFirstLogin: boolean;
  lastLoggedIn: string;
  establishment: LoggedInEstablishment;
  mainService: LoggedInMainService;
}
