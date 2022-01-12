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
    const req = http.expectOne(
      'https://sfccmstest.cloudapps.digital/items/bulk_upload_top_tips?fields=title,slug,link_title',
    );

    expect(req.request.method).toBe('GET');
  });

  it('should get the top tip for a given slug', () => {
    service.getTopTip('slug').subscribe();

    const slugFilter = '%7B%22slug%22:%7B%22_eq%22:%22slug%22%7D%7D';
    const fields = 'content,title,slug';

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(
      `https://sfccmstest.cloudapps.digital/items/bulk_upload_top_tips?filter=${slugFilter}&limit=1&fields=${fields}`,
    );

    expect(req.request.method).toBe('GET');
  });
});
