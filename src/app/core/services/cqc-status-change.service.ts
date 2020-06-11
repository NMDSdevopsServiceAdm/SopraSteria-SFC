import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { CqcChangeData } from '@core/model/cqc-change-data.model';
import { ApprovalRequest } from '@core/model/approval-request.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class CqcStatusChangeService {
  constructor(private http: HttpClient) {}

  public getCqcStatusChange(): Observable<CqcStatusChanges[]> {
    return this.http.get<CqcStatusChanges[]>('/api/admin/cqc-status-change/');
  }

  public CqcStatusChangeApproval(data: object) {
    return this.http.post<any>('/api/admin/cqc-status-change/', data);
  }

  public getCqcRequestByEstablishmentId(establishmentId: number): Observable<ApprovalRequest<CqcChangeData>> {
    return this.http.get<ApprovalRequest<CqcChangeData>>(
      `/api/approvals/establishment/${establishmentId}?type=CqcStatusChange&status=Pending`);
  }
}
