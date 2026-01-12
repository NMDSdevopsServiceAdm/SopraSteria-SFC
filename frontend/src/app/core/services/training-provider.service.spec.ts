import { TestBed } from '@angular/core/testing';

import { TrainingProviderService } from './training-provider.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { trainingRecord } from '@core/test-utils/MockWorkerService';
import { DeliveredBy } from '@core/model/training.model';

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

  describe('getAndProcessFormValue', () => {
    const mockTrainingProviders = [
      { id: 1, name: 'Preset provider name #1', isOther: false },
      { id: 63, name: 'other', isOther: true },
    ];

    describe('When training is delivered by an external provider', () => {
      it('should return the updated training data if provider is from the pre-defined list', async () => {
        const mockTrainingData = {
          deliveredBy: DeliveredBy.ExternalProvider,
          externalProviderName: 'Preset provider name #1',
        };

        const request = service.fillInTrainingProvider(mockTrainingData, mockTrainingProviders, 63);

        expect(service.getTrainingProviderIdFromName).toHaveBeenCalled;
        expect(request).toEqual({
          deliveredBy: DeliveredBy.ExternalProvider,
          trainingProviderId: 1,
          otherTrainingProviderName: null,
          externalProviderName: 'Preset provider name #1',
        });
      });

      it('should return the updated training data if provider is entered as free text', async () => {
        const mockTrainingData = {
          deliveredBy: DeliveredBy.ExternalProvider,
          externalProviderName: 'Udemy',
        };

        const request = service.fillInTrainingProvider(mockTrainingData, mockTrainingProviders, 63);

        expect(service.getTrainingProviderIdFromName).toHaveBeenCalled;
        expect(request).toEqual({
          deliveredBy: DeliveredBy.ExternalProvider,
          trainingProviderId: 63,
          otherTrainingProviderName: 'Udemy',
          externalProviderName: null,
        });
      });

      it('should return the updated training data if provider is left blank', async () => {
        const mockTrainingData = {
          deliveredBy: DeliveredBy.ExternalProvider,
          externalProviderName: null,
        };

        const request = service.fillInTrainingProvider(mockTrainingData, mockTrainingProviders, 63);

        expect(service.getTrainingProviderIdFromName).toHaveBeenCalled;
        expect(request).toEqual({
          deliveredBy: DeliveredBy.ExternalProvider,
          trainingProviderId: null,
          otherTrainingProviderName: null,
          externalProviderName: null,
        });
      });
    });

    it('should return the updated training data if deliveredBy is inHouseStaff', async () => {
      const mockTrainingData = {
        deliveredBy: DeliveredBy.InHouseStaff,
      };

      const request = service.fillInTrainingProvider(mockTrainingData, mockTrainingProviders, 63);

      expect(service.getTrainingProviderIdFromName).not.toHaveBeenCalled;
      expect(request).toEqual({
        deliveredBy: DeliveredBy.InHouseStaff,
        trainingProviderId: null,
        otherTrainingProviderName: null,
        externalProviderName: null,
      });
    });
  });

  describe('getTrainingProviderIdFromName', () => {
    it('should return the otherTrainingProvider object', async () => {
      const mockTrainingProviders = [
        { id: 1, name: 'Preset provider name #1', isOther: false },
        { id: 63, name: 'other', isOther: true },
      ];

      const request = service.getTrainingProviderIdFromName('Udemy', mockTrainingProviders, 63);

      expect(request).toEqual({ id: 63, name: 'other', isOther: true });
    });
  });
});
