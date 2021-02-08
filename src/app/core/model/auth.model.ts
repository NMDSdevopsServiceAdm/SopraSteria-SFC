import { Roles } from './roles.enum';

export interface Auth {
  agreedUpdatedTerms: boolean;
  establishment: {
    id: number;
    uid: string;
    name: string;
    isRegulated: boolean;
    isFirstBulkUpload: boolean;
    isParent: false;
    nmdsId: string;
  };
  expiryDate: string;
  fullname: string;
  isPrimary: boolean;
  lastLoggedIn: string;
  mainService: {
    id: number;
    name: string;
  };
  migratedUser: boolean;
  migratedUserFirstLogon: boolean;
  role: string;
  uid: string;
  username: string;
}

export interface UserToken {
  EstblishmentId: number;
  EstablishmentUID: string;
  role: Roles;
  isParent: boolean;
  userUid: string;
  sub: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
}
