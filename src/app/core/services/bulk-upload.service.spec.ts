import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BulkUploadService } from './bulk-upload.service';

describe('BulkUploadService', () => {
  let service: BulkUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BulkUploadService],
    });
    service = TestBed.inject(BulkUploadService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should get the bulk upload lock status of an establishment', () => {
    service.getLockStatus('establishmentId').subscribe();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/establishment/establishmentId/bulkupload/lockstatus');

    expect(req.request.method).toBe('GET');
  });
});
