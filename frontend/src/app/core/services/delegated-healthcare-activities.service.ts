import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DelegatedHealthcareActivity,
  GetDelegatedHealthcareActivitiesResponse,
} from '@core/model/delegated-healthcare-activities.model';

@Injectable({
  providedIn: 'root',
})
export class DelegatedHealthcareActivitiesService {
  private readonly _dhaDefinition: string =
    "We're using the term delegated healthcare to describe activities, usually (but not exclusively) of a clinical nature, that a regulated healthcare professional delegates to a paid care or support worker. Delegated healthcare activities are sometimes called 'tasks' or 'interventions'.";

  constructor(private http: HttpClient) {}

  get dhaDefinition(): string {
    return this._dhaDefinition;
  }

  getDelegatedHealthcareActivities(): Observable<DelegatedHealthcareActivity[]> {
    return this.http
      .get<GetDelegatedHealthcareActivitiesResponse>(
        `${environment.appRunnerEndpoint}/api/delegatedHealthcareActivities`,
      )
      .pipe(map((res) => res.allDHAs));
  }
}
