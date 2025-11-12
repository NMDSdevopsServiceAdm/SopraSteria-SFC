import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { DelegatedHealthcareActivitiesService } from './delegated-healthcare-activities.service';
import { provideHttpClient } from '@angular/common/http';

describe('DelegatedHealthcareActivitiesService', () => {
  let service: DelegatedHealthcareActivitiesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [DelegatedHealthcareActivitiesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DelegatedHealthcareActivitiesService);

    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should call the api/delegatedHealthcareActivities endpoint when getDelegatedHealthcareActivities called', () => {
    service.getDelegatedHealthcareActivities().subscribe();

    const req = http.expectOne(`${environment.appRunnerEndpoint}/api/delegatedHealthcareActivities`);
    expect(req.request.method).toBe('GET');
  });

  it('should call the expected endpoint when checkIfAnyWorkerHasDHAAnswered() called', () => {
    const mockEstablishmentUid = 'mock-uid';
    service.checkIfAnyWorkerHasDHAAnswered(mockEstablishmentUid).subscribe();

    const req = http.expectOne(
      `${environment.appRunnerEndpoint}/api/establishment/${mockEstablishmentUid}/delegatedHealthcareActivities/checkIfAnyWorkerHasDHAAnswered`,
    );
    expect(req.request.method).toBe('GET');
  });

  it('should call the /api/${establishmentId}/delegatedHealthcareActivities/noOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer endpoint', () => {
    const mockEstablishmentUid = 'mock-uid';
    service.getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(mockEstablishmentUid).subscribe();

    const req = http.expectOne(
      `${environment.appRunnerEndpoint}/api/establishment/${mockEstablishmentUid}/delegatedHealthcareActivities/noOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer`,
    );
    expect(req.request.method).toBe('GET');
  });

  describe('workersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer', () => {
    const endpoint = '/delegatedHealthcareActivities/workersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer';
    const mockEstablishmentUid = 'mock-uid';
    it('should call the expected endpoint', () => {
      service.getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(mockEstablishmentUid).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockEstablishmentUid}${endpoint}`,
      );
      expect(req.request.method).toBe('GET');
    });

    it('should call the endpoint with pagination query params if given', async () => {
      service
        .getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(mockEstablishmentUid, {
          pageIndex: 1,
          itemsPerPage: 15,
        })
        .subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${mockEstablishmentUid}${endpoint}?pageIndex=1&itemsPerPage=15`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
