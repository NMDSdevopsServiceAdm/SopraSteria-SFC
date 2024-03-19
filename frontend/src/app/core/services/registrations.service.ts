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
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationsService {
  constructor(private http: HttpClient) {}

  public getRegistrations(status: string): Observable<Registrations[]> {
    return this.http.get<Registrations[]>(`${environment.appRunnerEndpoint}/api/admin/registrations/${status}`);
  }

  public getSingleRegistration(establishmentUid: string): Observable<Registration> {
    return this.http.get<Registration>(`${environment.appRunnerEndpoint}/api/admin/registrations/status/${establishmentUid}`);
  }

  public updateWorkplaceId(data: UpdateWorkplaceIdRequest): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/registrations/updateWorkplaceId`, data);
  }

  public updatePostcode(data): Observable<any> {

    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/registrations/updatePostcode`, data);
  }

  public updateRegistrationStatus(data: UpdateRegistrationStatusRequest): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/registrations/updateRegistrationStatus`, data);
  }

  public registrationApproval(data: object) {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/approval/`, data);
  }

  public unlockAccount(data: object) {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/unlock-account/`, data);
  }

  public addRegistrationNote(data: object): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/registrations/addRegistrationNote`, data);
  }

  public getRegistrationNotes(establishmentUid: string): Observable<Note[]> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/admin/registrations/getRegistrationNotes/${establishmentUid}`);
  }
}
