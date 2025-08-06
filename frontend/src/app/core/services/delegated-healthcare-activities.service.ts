import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DelegatedHealthcareActivity,
  DelegatedHealthcareActivitiesResponse,
} from '@core/model/delegated-healthcare-activites.model';

@Injectable({
  providedIn: 'root',
})
export class DelegatedHealthcareActivitiesService {
  constructor(private http: HttpClient) {}

  getAllDelegatedHealthcareActivities(): Observable<DelegatedHealthcareActivity[]> {
    return this.http
      .get<DelegatedHealthcareActivitiesResponse>(`${environment.appRunnerEndpoint}/api/delegatedHealthcareActivities`)
      .pipe(map((res) => res.allDHAs));
  }
}
