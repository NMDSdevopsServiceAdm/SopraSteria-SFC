import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TrainingProviderService } from '@core/services/training-provider.service';

import { TrainingProvidersResolver } from './training-providers.resolver';

describe('TrainingProvidersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting(), TrainingProvidersResolver, TrainingProviderService],
    });

    const resolver = TestBed.inject(TrainingProvidersResolver);
    const trainingProviderService = TestBed.inject(TrainingProviderService);
    const getAllTrainingProvidersSpy = spyOn(trainingProviderService, 'getAllTrainingProviders');

    return { resolver, trainingProviderService, getAllTrainingProvidersSpy };
  }

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call the getTrainingProviders method', () => {
    const { resolver, getAllTrainingProvidersSpy } = setup();
    resolver.resolve();

    expect(getAllTrainingProvidersSpy).toHaveBeenCalled();
  });
});
