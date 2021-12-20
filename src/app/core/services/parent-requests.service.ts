import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ParentRequests } from '@core/model/parent-requests.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ParentRequestsService {
  constructor(private http: HttpClient) {}

  public getParentRequests(): Observable<ParentRequests[]> {
    return this.http.get<ParentRequests[]>('/api/admin/parent-approval/');
  }

  public getParentRequestByEstablishmentId(establishmentId: number): Observable<boolean> {
    return this.http.get<boolean>(`/api/approvals/establishment/${establishmentId}?type=BecomeAParent&status=Pending`);
  }

  public getIndividualParentRequest(establishmentUid: string): Observable<any> {
    return this.http.get<any>(`/api/admin/parent-approval/${establishmentUid}`);
  }

  public parentStatusRequested(establishmentId: number): Observable<boolean> {
    return this.getParentRequestByEstablishmentId(establishmentId).pipe(map((result) => result != null));
  }

  public updateApprovalStatus(data: object) {
    return this.http.post<any>('/api/admin/parent-approval/updateStatus', data);
  }

  public parentApproval(data: object) {
    return this.http.post<any>('/api/admin/parent-approval', data);
  }
  public becomeParent() {
    return this.http.post<any>('/api/approvals/become-a-parent/', null);
  }

  public cancelBecomeAParent() {
    return this.http.delete<any>('/api/approvals/become-a-parent/');
  }
}
