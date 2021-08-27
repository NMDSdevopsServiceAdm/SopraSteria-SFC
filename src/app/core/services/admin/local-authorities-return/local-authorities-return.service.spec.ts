import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LocalAuthoritiesReturnService } from './local-authorities-return.service';

describe('LocalAuthoriesReturnService', () => {
  let service: LocalAuthoritiesReturnService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocalAuthoritiesReturnService],
    });
    service = TestBed.inject(LocalAuthoritiesReturnService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the previous local authority return dates', () => {
    service.getDates().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/local-authority-return/dates');

    expect(req.request.method).toBe('GET');
  });

  it('should set new local authority return dates', () => {
    const laReturnStartDate = new Date('2000-01-01');
    const laReturnEndDate = new Date('2000-01-02');
    const data = {
      laReturnStartDate,
      laReturnEndDate,
    };
    service.setDates(data).subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/local-authority-return/dates');

    expect(req.request.method).toBe('POST');
    expect(req.request.body.laReturnStartDate).toEqual(laReturnStartDate);
    expect(req.request.body.laReturnEndDate).toEqual(laReturnEndDate);
  });

  it('should get a list of all of the local authorities', () => {
    service.getLAs().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/local-authority-return/monitor');

    expect(req.request.method).toBe('GET');
  });

  it('should reset las', () => {
    service.resetLAs().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/local-authority-return/monitor/reset');

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
  });
});
