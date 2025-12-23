import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TrainingProvider, GetTrainingProvidersResponse } from '@core/model/training-provider.model';
import { map } from 'rxjs/operators';
import { DeliveredBy } from '@core/model/training.model';

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

  public getAndProcessFormValue(trainingData, trainingProviders: TrainingProvider[], otherTrainingProviderId: number) {
    const externalProviderName = trainingData.externalProviderName;
    delete trainingData.externalProviderName;

    if (trainingData.deliveredBy !== DeliveredBy.ExternalProvider) {
      trainingData.trainingProviderId = null;
      trainingData.otherTrainingProviderName = null;
      trainingData.externalProviderName = null;
      return trainingData;
    }

    const trainingProvider = this.getTrainingProviderIdFromName(
      externalProviderName,
      trainingProviders,
      otherTrainingProviderId,
    );
    trainingData.trainingProviderId = trainingProvider.id;
    trainingData.otherTrainingProviderName = trainingProvider.isOther ? externalProviderName : null;

    return trainingData;
  }

  public getTrainingProviderIdFromName(
    externalProviderName: string,
    trainingProviders: TrainingProvider[],
    otherTrainingProviderId: number,
  ): TrainingProvider {
    const trimmedName = externalProviderName ? externalProviderName.trim() : '';
    const providerFound = trainingProviders.find((provider) => provider.name === trimmedName && !provider.isOther);

    if (providerFound) {
      return providerFound;
    }

    return { id: otherTrainingProviderId, name: 'other', isOther: true };
  }
}
