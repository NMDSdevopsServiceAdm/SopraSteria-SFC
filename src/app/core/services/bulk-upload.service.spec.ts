import { TestBed } from '@angular/core/testing';

import { BulkUploadService } from './bulk-upload.service';

describe('BulkUploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BulkUploadService = TestBed.get(BulkUploadService);
    expect(service).toBeTruthy();
  });
});
