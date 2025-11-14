import { TestBed } from '@angular/core/testing';

import { TrainingProviderService } from './training-provider.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('TrainingProviderService', () => {
  let service: TrainingProviderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrainingProviderService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTrainingProviders', () => {
    const baseEndpoint = `/api/trainingProviders`;

    it('should call GET trainingProviders endpoint', async () => {
      service.getAllTrainingProviders().subscribe();

      const req = http.expectOne(baseEndpoint);
      expect(req.request.method).toBe('GET');
    });
  });
});
