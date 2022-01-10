import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BulkUploadTopTipsService } from './bulk-upload-top-tips.service';

describe('BulkUploadTopTipsService', () => {
  let service: BulkUploadTopTipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BulkUploadTopTipsService],
    });
    service = TestBed.inject(BulkUploadTopTipsService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the top tip titles from the CMS', () => {
    service.getTopTipsTitles().subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('https://sfccmstest.cloudapps.digital/items/bulkuploadtoptips?fields=title');

    expect(req.request.method).toBe('GET');
  });
});
