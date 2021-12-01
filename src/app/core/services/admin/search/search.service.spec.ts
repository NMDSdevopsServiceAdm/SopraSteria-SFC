import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService],
    });
    service = TestBed.inject(SearchService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the search results for workplaces', () => {
    service.searchWorkplaces({ postcode: 'ab3 4de' }).subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/search/establishments');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ postcode: 'ab3 4de' });
  });
});
