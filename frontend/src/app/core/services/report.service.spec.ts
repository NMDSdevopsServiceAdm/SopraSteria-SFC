import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportService } from '@core/services/report.service';

describe('ReportService', () => {
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

  describe('getUserResearchInviteResponsesReport', () => {
    it('should call the api/reports/UserResearchInviteResponsesReport endpoint', () => {
      const baseEndpoint = `/api/reports/userResearchInviteResponsesReport`;
      service.getUserResearchInviteResponsesReport().subscribe();

      const req = http.expectOne(baseEndpoint);
      expect(req.request.method).toEqual('GET');
      expect(req.request.responseType).toEqual('blob');
      expect(req.request.url.includes('/api/reports/userResearchInviteResponsesReport')).toBeTruthy();
    });
  });
});
