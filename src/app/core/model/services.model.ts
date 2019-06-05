// TODO remove below and use Workplace instead
export interface Service {
  id: number;
  isMyService?: boolean;
  name: string;
  other?: boolean;
  otherName?: string;
}

// TODO remove below and use WorkplaceCategory instead
export interface ServiceGroup {
  category: string;
  services: Service[];
}

// TODO is this used??
export interface Services {
  value: Service;
  index: number;
  array: Service[];
}
