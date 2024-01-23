import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServiceUsersService {
  constructor(private http: HttpClient) {}

  getServiceUsers() {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/serviceUsers`);
  }
}
