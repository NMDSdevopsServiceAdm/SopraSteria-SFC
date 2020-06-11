
export interface CqcStatusChangeData {
  currentService: {
    ID: number;
    name: string;
    other?: string;
  };
  requestedService: {
    ID: number;
    name: string;
    other?: string;
  };
}
