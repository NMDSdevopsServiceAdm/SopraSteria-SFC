import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TrainingProvider, GetTrainingProvidersResponse } from '@core/model/training-provider.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrainingProviderService {
  constructor(private http: HttpClient) {}

  public getAllTrainingProviders(): Observable<Array<TrainingProvider>> {
    return this.http
      .get<GetTrainingProvidersResponse>(`${environment.appRunnerEndpoint}/api/trainingProviders`)
      .pipe(map((res) => res.trainingProviders));
  }
}
