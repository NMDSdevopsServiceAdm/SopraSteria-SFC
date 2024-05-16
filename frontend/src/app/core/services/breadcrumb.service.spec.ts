import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [BreadcrumbService],
    });
    service = TestBed.inject(BreadcrumbService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getPath', () => {
    const createUrlSegment = (path) => {
      return { path } as UrlSegment;
    };

    it('should return same url when no parameters', () => {
      const expected = '/test-url/workplace';
      const result = service.getPath('/test-url/workplace', [
        createUrlSegment('test-url'),
        createUrlSegment('workplace'),
      ]);

      expect(result).toEqual(expected);
    });

    it('should return url with parameter replaced by corresponding url segment', () => {
      const expected = '/test-url/fakeUid123';
      const result = service.getPath('/test-url/:establishmentuid', [
        createUrlSegment('test-url'),
        createUrlSegment('fakeUid123'),
      ]);

      expect(result).toEqual(expected);
    });

    it('should return url with parameter replaced by following url segment when param is establishmentuid and corresponding segment is workplace', () => {
      const expected = '/test-url/fakeUid123';
      const result = service.getPath('/test-url/:establishmentuid', [
        createUrlSegment('test-url'),
        createUrlSegment('workplace'),
        createUrlSegment('fakeUid123'),
      ]);

      expect(result).toEqual(expected);
    });
  });
});
