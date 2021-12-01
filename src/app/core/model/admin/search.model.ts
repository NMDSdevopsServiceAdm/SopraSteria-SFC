export interface WorkplaceSearchRequest {
  workplaceName?: string;
  postcode?: string;
  workplaceId?: string;
  locationId?: string;
  providerId?: string;
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
  address2: string;
  NameValue: string;
  Parent: string;
  county: string;
  dataOwner: string;
  isParent: boolean;
  isRegulated: boolean;
  locationId: string;
  provId: string;
  nmdsId: string;
  postcode: string;
  town: string;
  uid: string;
  updated: string;
  parent: Parent;
  users: User[];
}
