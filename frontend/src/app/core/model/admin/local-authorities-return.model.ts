export interface SetDates {
  laReturnStartDate: Date;
  laReturnEndDate: Date;
}

export interface Area {
  letter: string;
  name: string;
  open: boolean;
}

export interface LA {
  name: string;
  workers: number;
  notes: boolean;
  status: string;
  localAuthorityUID: string;
}

export interface LAs {
  B?: LA[];
  C?: LA[];
  D?: LA[];
  E?: LA[];
  F?: LA[];
  G?: LA[];
  H?: LA[];
  I?: LA[];
  J?: LA[];
}

export interface IndividualLA {
  name: string;
  workers: number;
  notes: string;
  status: string;
}
