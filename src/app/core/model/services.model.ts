
export interface ServicesModel {
  id: number;
  name: string;
  mainService: [{
    id: number;
    name: string;
  }];
  allOtherServices: [{
    category: string;
    services: [{
      id: number;
      name: string;
      isMyService: boolean;
    }];
  }];
  otherServices: [{
    category: string;
    services: [{
      id: number;
      name: string;
      isMyService: boolean;
    }];
  }];
}

