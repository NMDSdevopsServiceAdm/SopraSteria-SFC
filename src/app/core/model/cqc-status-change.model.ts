import { int } from 'aws-sdk/clients/datapipeline';

export interface CqcStatusChange {
  requestId: number;
  requestUUID: string;
  establishmentId: number;
  establishmentUid: string;
  userId: number;
  workplaceId: string;
  userName: string;
  orgName: string;
  requested: Date;
  status: string;
  currentService: {
    ID: number;
    name: string;
  };
  requestedService: {
    ID: number;
    name: string;
  };
}
