import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { Observable } from 'rxjs';

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

  public getCqcRequestByEstablishmentId(establishmentId: number): Observable<any> {
    return this.http.get<boolean>(`/api/approvals/establishment/${establishmentId}?type=CqcStatusChange&status=Pending`);
  }
}
