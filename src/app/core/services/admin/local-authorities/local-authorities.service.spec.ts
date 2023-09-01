import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LocalAuthoritiesService } from './local-authorities.service';

describe('LocalAuthoritiesService', () => {
  let service: LocalAuthoritiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocalAuthoritiesService],
    });
    service = TestBed.inject(LocalAuthoritiesService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a list of all of the local authorities', () => {
    service.getLAsList().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/local-authorities');

    expect(req.request.method).toBe('GET');
  });
});
