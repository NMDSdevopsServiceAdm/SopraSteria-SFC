import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { WorkplaceInterfaceService } from './workplace-interface.service';

describe('WorkplaceInterfaceService', () => {
  let service: WorkplaceInterfaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkplaceInterfaceService],
    });
    service = TestBed.inject(WorkplaceInterfaceService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('establishmentExistsCheck', () => {
    it('should call the establishmentExistsCheck endpoint', () => {
      service.establishmentExistsCheck('1-1234567890').subscribe();

      const req = http.expectOne('/api/registration/establishmentExistsCheck');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ locationID: '1-1234567890' });
    });
  });
});
