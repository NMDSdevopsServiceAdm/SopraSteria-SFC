import {
  CareWorkforcePathwayRoleCategory,
  CareWorkforcePathwayRoleCategoryResponse,
} from '@core/model/careWorkforcePathwayCategory.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
}
