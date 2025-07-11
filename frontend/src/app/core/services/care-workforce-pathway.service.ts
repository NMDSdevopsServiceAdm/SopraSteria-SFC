import {
  CareWorkforcePathwayWorkplaceAwarenessAnswer,
  CareWorkforcePathwayWorkplaceAwarenessResponse,
} from '@core/model/care-workforce-pathway.model';
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
import { CareWorkforcePathwayWorkplaceAwareness } from '@core/model/establishment.model';

@Injectable({
  providedIn: 'root',
})
export class CareWorkforcePathwayService {
  private _awarenessAnswersTruthyIds = [1, 2, 3];

  constructor(private http: HttpClient) {}

  getCareWorkforcePathwayWorkplaceAwarenessAnswers(): Observable<CareWorkforcePathwayWorkplaceAwarenessAnswer[]> {
    return this.http
      .get<CareWorkforcePathwayWorkplaceAwarenessResponse>(
        `${environment.appRunnerEndpoint}/api/careWorkforcePathwayWorkplaceAwarenessAnswers`,
      )
      .pipe(map((res) => res.careWorkforcePathwayWorkplaceAwarenessAnswers));
  }

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

  isAwareOfCareWorkforcePathway(awarenessAnswer: CareWorkforcePathwayWorkplaceAwareness): boolean {
    return this._awarenessAnswersTruthyIds.includes(awarenessAnswer?.id);
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
