import { Note } from '../registrations.model';

export interface UserSearchRequest {
  username?: string;
  name?: string;
  emailAddress?: string;
}

export interface Establishment {
  uid: string;
  name: string;
  nmdsId: string;
  postcode: string;
  address?: string;
  isParent?: false;
  isRegulated?: false;
  locationId?: string;
  parent?: Parent;
  ustatus?: string;
}
export interface UserSearchItem {
  uid: string;
  name: string;
  username: string;
  securityQuestion: string;
  securityQuestionAnswer: string;
  isLocked: boolean;
  email?: string;
  invalidAttempt?: number;
  isPrimary?: boolean;
  lastLoggedIn?: string;
  passwdLastChanged?: string;
  phone?: string;
  establishment: Establishment;
}

export interface WorkplaceSearchRequest {
  name?: string;
  postcode?: string;
  nmdsId?: string;
  locationId?: string;
  provId?: string;
}

export interface Parent {
  uid?: string;
  nmdsId?: string;
  postcode?: string;
}

export interface User {
  isLocked: boolean;
  name: string;
  securityAnswer: string;
  securityQuestion: string;
  uid: string;
  username: string;
}

export interface Subsidiaries {
  name: string;
}
export interface WorkplaceSearchItem {
  address1: string;
  address2?: string;
  name: string;
  county?: string;
  dataOwner: string;
  isParent?: boolean;
  isRegulated: boolean;
  locationId: string;
  providerId: string;
  nmdsId: string;
  postcode: string;
  town: string;
  uid: string;
  updated?: string;
  employerType?: { value?: string; other?: string };
  parent?: Parent;
  users: User[];
  notes: Note[];
  subsidiaries: Subsidiaries[];
}

export interface GroupSearchRequest {
  employerType: string;
  parent: boolean;
}
