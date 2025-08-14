import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DelegatedHealthcareActivitiesService } from './delegated-healthcare-activities.service';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

describe('DelegatedHealthcareActivitiesService', () => {
  let service: DelegatedHealthcareActivitiesService;
  let http: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DelegatedHealthcareActivitiesService],
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
});
