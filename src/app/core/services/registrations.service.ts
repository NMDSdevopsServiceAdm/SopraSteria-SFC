import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Note,
  Registration,
  Registrations,
  UpdateRegistrationStatusRequest,
  UpdateWorkplaceIdRequest,
} from '@core/model/registrations.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationsService {
  constructor(private http: HttpClient) {}
  public getAllRegistrations(): Observable<Registrations[]> {
    return this.http.get<Registrations[]>('/api/admin/registrations');
  }

  public getRegistrations(status: string): Observable<any> {
    return this.http.get<Registrations[]>(`/api/admin/registrations/${status}`);
  }

  public getSingleRegistration(establishmentUid: string): Observable<Registration> {
    return this.http.get<Registration>(`/api/admin/registrations/status/${establishmentUid}`);
  }

  public updateWorkplaceId(data: UpdateWorkplaceIdRequest): Observable<any> {
    return this.http.post<any>(`/api/admin/registrations/updateWorkplaceId`, data);
  }

  public updateRegistrationStatus(data: UpdateRegistrationStatusRequest): Observable<any> {
    return this.http.post<any>(`/api/admin/registrations/updateRegistrationStatus`, data);
  }

  public registrationApproval(data: object) {
    return this.http.post<any>('/api/admin/approval/', data);
  }

  public unlockAccount(data: object) {
    return this.http.post<any>('/api/admin/unlock-account/', data);
  }

  public addRegistrationNote(data: object): Observable<any> {
    return this.http.post<any>('/api/admin/registrations/addRegistrationNote', data);
  }

  public getRegistrationNotes(establishmentUid: string): Observable<Note[]> {
    return this.http.get<any>(`/api/admin/registrations/getRegistrationNotes/${establishmentUid}`);
  }
}
