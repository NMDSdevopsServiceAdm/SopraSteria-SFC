export interface CqcChangeData {
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
