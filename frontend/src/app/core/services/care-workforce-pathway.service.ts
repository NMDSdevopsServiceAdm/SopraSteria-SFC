import {
  CareWorkforcePathwayRoleCategory,
  CareWorkforcePathwayRoleCategoryResponse,
} from '@core/model/careWorkforcePathwayCategory.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobRole } from '@core/model/job.model';

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

  getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId): Observable<any> {
    return this.http
      .get<any>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
      )
      .pipe(map((res) => res));
  }

  getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentId: string): Observable<CWPWorkersResponse> {
    const mockResponse = {
      workers: [
        {
          uid: 'mock-worker-uid',
          nameOrId: 'Anna Smith',
          mainJob: { jobRoleName: 'Care worker', jobId: 1 },
        },
      ],
    };
    return of(mockResponse);
  }
}

export type CWPWorkersResponse = {
  workers: Array<{ uid: string; nameOrId: string; mainJob: JobRole }>;
};
