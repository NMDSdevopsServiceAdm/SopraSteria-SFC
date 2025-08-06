import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  DelegatedHealthcareActivity,
  GetDelegatedHealthcareActivitiesResponse,
} from '@core/model/delegated-healthcare-activities.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DelegatedHealthcareActivitiesService {
  constructor(private http: HttpClient) {}

  getDelegatedHealthcareActivities(): Observable<DelegatedHealthcareActivity[]> {
    return this.http
      .get<GetDelegatedHealthcareActivitiesResponse>(
        `${environment.appRunnerEndpoint}/api/delegatedHealthcareActivities`,
      )
      .pipe(map((res) => res.allDHAs));
  }
}
