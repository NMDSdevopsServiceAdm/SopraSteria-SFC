export interface Service {
  id: number;
  isMyService?: boolean;
  name: string;
  other?: boolean;
}

export interface ServiceGroup {
  category: string;
  services: Service[];
}

export interface AllServicesResponse {
  allOtherServices: ServiceGroup[];
}

export interface ServicesModel {
  id: number;
  name: string;
  mainService: [
    {
      id: number;
      name: string;
    }
  ];
  allOtherServices: [
    {
      category: string;
      services: [
        {
          id: number;
          name: string;
          isMyService: boolean;
        }
      ];
    }
  ];
  otherServices: [
    {
      category: string;
      services: [
        {
          id: number;
          name: string;
          isMyService: boolean;
        }
      ];
    }
  ];
}
