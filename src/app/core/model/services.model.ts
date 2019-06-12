export interface Service {
  id: number;
  isMyService?: boolean;
  isCQC: boolean;
  name: string;
  other?: boolean;
  otherName?: string;
}

export interface ServiceGroup {
  category: string;
  services: Service[];
}

export interface Services {
  value: Service;
  index: number;
  array: Service[];
}

export interface ServiceUserGroup {
  group: string;
  services: ServiceForUser[];
}

export interface ServiceForUser {
  id: number;
  service: string;
  other: boolean;
}

export interface AllServicesResponse {
  allOtherServices: ServiceGroup[];
}
