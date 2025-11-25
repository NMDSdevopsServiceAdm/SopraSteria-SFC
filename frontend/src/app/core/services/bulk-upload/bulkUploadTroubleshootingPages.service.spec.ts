import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { BulkUploadTroubleshootingPagesService } from './bulkUploadTroubleshootingPages.service';
import { provideHttpClient } from '@angular/common/http';

describe('BulkUploadTroubleshootingPagesService', () => {
  let service: BulkUploadTroubleshootingPagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [BulkUploadTroubleshootingPagesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BulkUploadTroubleshootingPagesService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBulkUploadTroubleshootingPage', () => {
    it('should get troubleshooting pages from the CMS', () => {
      service.getBulkUploadTroubleshootingPage().subscribe();

      const http = TestBed.inject(HttpTestingController);
      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/cms/items/troubleshooting?fields=title,content&env=${environment.environmentName}`,
      );

      expect(req.request.method).toBe('GET');
    });
  });
});
