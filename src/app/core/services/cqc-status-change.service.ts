import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ParentRequest } from '@core/model/parent-request.model';

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

  public getCqcRequestByEstablishmentId(establishmentId: number): Observable<ParentRequest> {
    return this.http.get<ParentRequest>(`/api/approvals/establishment/${establishmentId}?type=CqcStatusChange&status=Pending`);
  }
}
