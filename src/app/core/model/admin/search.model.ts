import { Note } from '../registrations.model';

export interface WorkplaceSearchRequest {
  name?: string;
  postcode?: string;
  nmdsId?: string;
  locationId?: string;
  provId?: string;
}

export interface Parent {
  uid: string;
  nmdsId: string;
}

export interface User {
  isLocked: boolean;
  name: string;
  securityAnswer: string;
  securityQuestion: string;
  uid: string;
  username: string;
}

export interface WorkplaceSearchItem {
  address1: string;
  address2?: string;
  name: string;
  Parent?: string;
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
  parent?: Parent;
  users: User[];
  notes: Note[];
}
