import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
  DelegatedHealthcareActivity,
  GetDelegatedHealthcareActivitiesResponse,
} from '@core/model/delegated-healthcare-activities.model';
import { JobRole } from '@core/model/job.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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

  getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(
    establishmentId: string,
  ): Observable<DHAGetNumberOfWorkersResponse> {
    return this.http
      .get<DHAGetNumberOfWorkersResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/delegatedHealthcareActivities/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
      )
      .pipe(map((res) => res));
  }

  getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(
    establishmentId: string,
    queryParams: Params = {},
  ): Observable<DHAGetAllWorkersResponse> {
    return this.http.get<DHAGetAllWorkersResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/delegatedHealthcareActivities/WorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer`,
      { params: queryParams },
    );
  }
}

export type DHAGetNumberOfWorkersResponse = {
  noOfWorkersWhoRequiresAnswer: number;
};

export type DHAGetAllWorkersResponse = {
  workers: { uid: string; nameOrId: string; mainJob: JobRole }[];
  workerCount: number;
};
