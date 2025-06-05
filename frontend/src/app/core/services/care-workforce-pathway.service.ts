import {
  CareWorkforcePathwayRoleCategory,
  CareWorkforcePathwayRoleCategoryResponse,
} from '@core/model/careWorkforcePathwayCategory.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobRole } from '@core/model/job.model';
import { Params } from '@angular/router';
import { CareWorkforcePathwayUseReason } from '@core/model/care-workforce-pathway.model';

@Injectable({
  providedIn: 'root',
})
export class CareWorkforcePathwayService {
  constructor(private http: HttpClient) {}

  getCareWorkforcePathwayRoleCategories(): Observable<CareWorkforcePathwayRoleCategory[]> {
    return this.http
      .get<CareWorkforcePathwayRoleCategoryResponse>(
        `${environment.appRunnerEndpoint}/api/careWorkforcePathwayRoleCategories`,
      )
      .pipe(map((res) => res.careWorkforcePathwayRoleCategories));
  }

  getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(
    establishmentId: string,
  ): Observable<CWPGetNumberOfWorkersResponse> {
    return this.http
      .get<CWPGetNumberOfWorkersResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
      )
      .pipe(map((res) => res));
  }

  getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(
    establishmentId: string,
    queryParams: Params = {},
  ): Observable<CWPGetAllWorkersResponse> {
    return this.http.get<CWPGetAllWorkersResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/workersWhoRequireCareWorkforcePathwayRoleAnswer`,
      { params: queryParams },
    );
  }

  getAllCareWorkforcePathwayUseReasons(): Observable<CWPGetUseReasonsResponse> {
    return this.http.get<CWPGetUseReasonsResponse>(
      `${environment.appRunnerEndpoint}/api/careWorkforcePathway/useReasons`,
    );
  }
}

export type CWPGetNumberOfWorkersResponse = {
  noOfWorkersWhoRequireAnswers: number;
};

export type CWPGetAllWorkersResponse = {
  workers: { uid: string; nameOrId: string; mainJob: JobRole }[];
  workerCount: number;
};

export type CWPGetUseReasonsResponse = {
  allReasons: Array<CareWorkforcePathwayUseReason>;
};
