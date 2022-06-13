import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EstablishmentService } from './establishment.service';

describe('EstablishmentService', () => {
  let service: EstablishmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EstablishmentService],
    });
    service = TestBed.inject(EstablishmentService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('postStaffRecruitmentData', () => {
    it('should call postStaffRecruitmentData for a given establishment with the correct data', () => {
      service.postStaffRecruitmentData('establishmentId', { amountSpent: '100' }).subscribe();

      const req = http.expectOne('/api/establishment/establishmentId/staffRecruitmentData');

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ staffRecruitmentData: { amountSpent: '100' } });
    });
  });
});
