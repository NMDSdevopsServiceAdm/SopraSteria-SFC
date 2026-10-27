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
import {
  CareWorkforcePathwayWorkplaceAwareness,
  SortStaffOptionsForCWPWorkerSummary,
} from '@core/model/establishment.model';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class CareWorkforcePathwayService {
  private _awarenessAnswersTruthyIds = [1, 2, 3];
  private _workerSummaryPaginationSettings: null | CWPWorkerSummaryPaginationSettings = null;

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

  countWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId: string): Observable<CWPCountWorkersResponse> {
    return this.http
      .get<CWPCountWorkersResponse>(
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

  getWorkersWhoMeetNewToCareCriteria(
    establishmentId: string,
  ): Observable<CWPGetAllWorkersWhoMeetNewToCareCriteriaResponse['workers']> {
    return this.http
      .get<CWPGetAllWorkersWhoMeetNewToCareCriteriaResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/workersWhoMeetNewToCareCriteria`,
      )
      .pipe(map((res) => res.workers));
  }

  getAllCareWorkforcePathwayUseReasons(): Observable<CWPGetUseReasonsResponse> {
    return this.http.get<CWPGetUseReasonsResponse>(
      `${environment.appRunnerEndpoint}/api/careWorkforcePathway/useReasons`,
    );
  }

  isAwareOfCareWorkforcePathway(awarenessAnswer: CareWorkforcePathwayWorkplaceAwareness): boolean {
    return this._awarenessAnswersTruthyIds.includes(awarenessAnswer?.id);
  }

  get workerSummaryPaginationSettings(): CWPWorkerSummaryPaginationSettings | null {
    return this._workerSummaryPaginationSettings;
  }

  set workerSummaryPaginationSettings(settings: CWPWorkerSummaryPaginationSettings | null) {
    this._workerSummaryPaginationSettings = settings;
  }

  get defaultPaginationSettings(): CWPWorkerSummaryPaginationSettings {
    return DefaultPaginationSettingsForCWPWorkerSummary;
  }
}

export type CWPCountWorkersResponse = {
  workerCount: number;
};

export type CWPGetAllWorkersResponse = {
  workers: {
    uid: string;
    nameOrId: string;
    mainJob: JobRole;
    MainJobStartDateValue: string | null;
    CareWorkforcePathwayRoleCategorySavedAt?: string | null;
    CareWorkforcePathwayRoleCategoryChangedAt?: string | null;
    careWorkforcePathwayRoleCategory: CareWorkforcePathwayRoleCategory;
  }[];
  workerCount: number;
};

export type CWPGetAllWorkersWhoMeetNewToCareCriteriaResponse = {
  workers: {
    uid: string;
    nameOrId: string;
    mainJob: JobRole;
    MainJobStartDateValue: string | null;
    CareWorkforcePathwayRoleCategorySavedAt?: string | null;
    CareWorkforcePathwayRoleCategoryChangedAt?: string | null;
    careWorkforcePathwayRoleCategory: CareWorkforcePathwayRoleCategory;
  }[];
};

export type CWPGetUseReasonsResponse = {
  allReasons: Array<CareWorkforcePathwayUseReason>;
};

export type CWPWorkerSummaryPaginationSettings = {
  pageIndex: number;
  itemsPerPage: number;
  sortBy: string;
};

const DefaultPaginationSettingsForCWPWorkerSummary: CWPWorkerSummaryPaginationSettings = {
  itemsPerPage: 15,
  pageIndex: 0,
  sortBy: Object.keys(SortStaffOptionsForCWPWorkerSummary)[0],
};
