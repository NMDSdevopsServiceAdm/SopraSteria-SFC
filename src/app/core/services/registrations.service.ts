import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Registrations, UpdateWorkplaceIdRequest } from '@core/model/registrations.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationsService {
  constructor(private http: HttpClient) {}

  public getRegistrations(): Observable<Registrations[]> {
    return this.http.get<Registrations[]>('/api/admin/registrations/');
  }

  public getSingleRegistration(establishmentUid: string): Observable<Registrations[]> {
    return this.http.get<Registrations[]>(`/api/admin/registrations/${establishmentUid}`);
  }

  public updateWorkplaceId(data: UpdateWorkplaceIdRequest): Observable<any> {
    return this.http.post<any>(`/api/admin/registrations/updateWorkplaceId`, data);
  }

  public registrationApproval(data: object) {
    return this.http.post<any>('/api/admin/approval/', data);
  }

  public unlockAccount(data: object) {
    return this.http.post<any>('/api/admin/unlock-account/', data);
  }
}
