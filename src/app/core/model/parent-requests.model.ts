import { ApprovalRequest } from '@core/model/approval-request.model';

export interface ParentRequests {
  [index: number]: ApprovalRequest<any>;
}
