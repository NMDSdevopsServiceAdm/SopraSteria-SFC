import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Registrations } from '@core/model/registrations.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationsService {
  constructor(private http: HttpClient) {}

  public getRegistrations(): Observable<Registrations[]> {
    return this.http.get<Registrations[]>('/api/admin/registrations/');
  }

  public userApproval(data: object) {
    return this.http.post<any>('/api/admin/approval/', data);
  }
}
