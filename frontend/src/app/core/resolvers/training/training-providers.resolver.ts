import { Injectable } from '@angular/core';
import { TrainingProvider } from '@core/model/training-provider.model';
import { TrainingProviderService } from '@core/services/training-provider.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingProvidersResolver {
  constructor(private trainingProviderService: TrainingProviderService) {}

  resolve(): Observable<Array<TrainingProvider>> {
    return this.trainingProviderService.getAllTrainingProviders();
  }
}
