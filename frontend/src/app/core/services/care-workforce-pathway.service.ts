import {
  CareWorkforcePathwayWorkplaceAwarenessAnswer,
  CareWorkforcePathwayWorkplaceAwarenessResponse
} from '@core/model/care-workforce-pathway.model';
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

  getCareWorkforcePathwayWorkplaceAwarenessAnswers(): Observable<CareWorkforcePathwayWorkplaceAwarenessAnswer[]> {
    return this.http
      .get<CareWorkforcePathwayWorkplaceAwarenessResponse>(
        `${environment.appRunnerEndpoint}/api/careWorkforcePathwayWorkplaceAwarenessAnswers`,
      )
      .pipe(map((res) => res.careWorkforcePathwayWorkplaceAwarenessAnswers));
  }
}
