import { TestBed, async, inject } from '@angular/core/testing';

import { BulkUploadGuard } from './bulk-upload.guard';

describe('BulkUploadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BulkUploadGuard]
    });
  });

  it('should ...', inject([BulkUploadGuard], (guard: BulkUploadGuard) => {
    expect(guard).toBeTruthy();
  }));
});
