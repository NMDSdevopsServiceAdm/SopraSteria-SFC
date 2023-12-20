import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApprovalRequest } from '@core/model/approval-request.model';
import { CqcChangeData } from '@core/model/cqc-change-data.model';
import { CqcStatusChange } from '@core/model/cqc-status-change.model';
import { CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CqcStatusChangeService {
  constructor(private http: HttpClient) {}

  public getCqcStatusChanges(): Observable<CqcStatusChanges[]> {
    return this.http.get<CqcStatusChanges[]>(`${environment.appRunnerEndpoint}/api/admin/cqc-status-change/`);
  }

  public CqcStatusChangeApproval(data: object) {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/cqc-status-change/`, data);
  }

  public getIndividualCqcStatusChange(establishmentUid: string): Observable<CqcStatusChange> {
    return this.http.get<CqcStatusChange>(`${environment.appRunnerEndpoint}/api/admin/cqc-status-change/${establishmentUid}`);
  }

  public updateApprovalStatus(data): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/cqc-status-change/updateStatus`, data);
  }

  public getCqcRequestByEstablishmentId(establishmentId: number): Observable<ApprovalRequest<CqcChangeData>> {
    return this.http.get<ApprovalRequest<CqcChangeData>>(
      `${environment.appRunnerEndpoint}/api/approvals/establishment/${establishmentId}?type=CqcStatusChange&status=Pending`,
    );
  }
}
