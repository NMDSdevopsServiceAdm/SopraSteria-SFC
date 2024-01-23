import { CqcChangeData } from '@core/model/cqc-change-data.model';
import { ApprovalRequest } from '@core/model/approval-request.model';

export interface CqcStatusChanges {
  [index: number]: ApprovalRequest<CqcChangeData>;
}
