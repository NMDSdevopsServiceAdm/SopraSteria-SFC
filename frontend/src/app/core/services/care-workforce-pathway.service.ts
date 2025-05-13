import {
  CareWorkforcePathwayCategory,
  CareWorkforcePathwayResponse,
} from '@core/model/careWorkforcePathwayCategory.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CareWorkforcePathwayService {
  constructor(private http: HttpClient) {}

  // getCareWorkforcePathwayCategories(): Observable<CareWorkforcePathwayCategory[]>{
  //   return this.http
  //     .get<CareWorkforcePathwayResponse>(`${environment.appRunnerEndpoint}/api/careWorkforcePathwayCategories`)
  //     .pipe(map((res) => res.careWorkforcePathwayCategories));
  // }

  getCareWorkforcePathwayCategories(): CareWorkforcePathwayCategory[] {
    return [
      {
        id: 1,
        title: 'New',
        description: 'Starting point',
      },
      {
        id: 2,
        title: 'Care',
        description: 'Established',
      },
    ];
  }
}
