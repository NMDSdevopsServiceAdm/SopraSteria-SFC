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

  it('should get the search results for users', () => {
    service.searchUsers({ name: 'Joe Bloggs' }).subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/search/users');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Joe Bloggs' });
  });

  it('should get the search results for users', () => {
    service.searchGroups({ employerType: 'All', parent: true }).subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/admin/search/groups');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ employerType: 'All', parent: true });
  });
});
