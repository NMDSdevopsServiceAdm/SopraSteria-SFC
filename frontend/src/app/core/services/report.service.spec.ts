import { TestBed } from '@angular/core/testing';

import { TrainingProviderService } from './training-provider.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { trainingRecord } from '@core/test-utils/MockWorkerService';
import { DeliveredBy } from '@core/model/training.model';
import { ReportService } from '@core/services/report.service';

fdescribe('ReportService', () => {
  let service: ReportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSatisfactionSurveyReport', () => {
    it('should call the api/reports/satisfactionSurvey/new endpoint', () => {
      const baseEndpoint = `/api/reports/satisfactionSurvey/new`;
      service.getSatisfactionSurveyReport().subscribe();

      const req = http.expectOne(baseEndpoint);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.url.includes('/api/reports/satisfactionSurvey/new')).toBeTruthy();
    });
  });

  describe('getUserResearchInviteResponseReport', () => {
    it('should call the api/reports/UserResearchInviteResponseReport endpoint', () => {
      const baseEndpoint = `/api/reports/UserResearchInviteResponseReport`;
      service.getUserResearchInviteResponseReport().subscribe();

      const req = http.expectOne(baseEndpoint);
      expect(req.request.method).toEqual('GET');
      expect(req.request.responseType).toEqual('blob');
      expect(req.request.url.includes('/api/reports/UserResearchInviteResponseReport')).toBeTruthy();
    });
  });
});
