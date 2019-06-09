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
