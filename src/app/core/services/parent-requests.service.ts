import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ParentRequests } from '@core/model/parent-requests.model';
import { Observable } from 'rxjs';
import { ParentRequest } from '@core/model/parent-request.model';

@Injectable({
  providedIn: 'root',
})
export class ParentRequestsService {
  constructor(private http: HttpClient) {}

  public getParentRequests(): Observable<ParentRequests[]> {
    return this.http.get<ParentRequests[]>('/api/admin/parent-approval/');
  }

  public getParentRequest(uuid: string, establishmentId: string): Observable<ParentRequest> {
    return this.http.get<ParentRequest>(`/api/establishments/${establishmentId}/parentApproval/${uuid}`);
  }

  public parentApproval(data: object) {
    return this.http.post<any>('/api/admin/parent-approval/', data);
  }
}
