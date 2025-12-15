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

    it('should return the updated training data if deliveredBy is externalProvider', async () => {
      const mockTrainingData = {
        ...trainingRecord,
        externalProviderName: 'Udemy',
        deliveredBy: DeliveredBy.ExternalProvider,
        isOther: true,
      };

      const request = service.getAndProcessFormValue(mockTrainingData, mockTrainingProviders, 63);

      expect(service.getTrainingProviderIdFromName).toHaveBeenCalled;
      expect(request).toEqual({
        ...mockTrainingData,
        trainingProviderId: 63,
        isOther: mockTrainingData.isOther,
      });
    });

    it('should return the updated training data if deliveredBy is inHouseStaff', async () => {
      const mockTrainingData = {
        ...trainingRecord,
        deliveredBy: DeliveredBy.InHouseStaff,
      };

      const request = service.getAndProcessFormValue(mockTrainingData, mockTrainingProviders, 63);

      expect(service.getTrainingProviderIdFromName).not.toHaveBeenCalled;
      expect(request).toEqual({
        ...mockTrainingData,
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
      // const payload = {
      //   externalProviderName:
      //   trainingProviders: mockTrainingProviders,
      //   otherTrainingProviderId: 63,
      // };

      const request = service.getTrainingProviderIdFromName('Udemy', mockTrainingProviders, 63);

      expect(request).toEqual({ id: 63, name: 'other', isOther: true });
    });
  });
});
