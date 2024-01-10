import { CqcChangeData } from '@core/model/cqc-change-data.model';

export interface CqcStatusChange {
  status: string;
  requestId: number;
  requestUid: string;
  createdAt: string;
  username: string;
  userId: number;
  establishment: Establishment;
  data: CqcChangeData;
}

export interface Establishment {
  status: string;
  inReview: boolean;
  reviewer?: string;
  establishmentId: number;
  establishmentUid: string;
  workplaceId: string;
  name: string;
  address1: string;
  address2?: string;
  address3?: string;
  town?: string;
  county?: string;
  postcode: string;
}
