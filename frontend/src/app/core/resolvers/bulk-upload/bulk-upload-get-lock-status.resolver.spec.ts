import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { BulkUploadGetLockStatusResolver } from './bulk-upload-get-lock-status.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule } from '@angular/router';

describe('BulkUploadGetLockStatusResolver', () => {
  let resolver: BulkUploadGetLockStatusResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        BulkUploadGetLockStatusResolver,
        {
          provide: EstablishmentService,
          useValue: {
            establishmentId: 'establishmentId',
          },
        },

        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    resolver = TestBed.inject(BulkUploadGetLockStatusResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const bulkUploadService = TestBed.inject(BulkUploadService);
    spyOn(bulkUploadService, 'getLockStatus').and.callThrough();

    resolver.resolve();

    expect(bulkUploadService.getLockStatus).toHaveBeenCalledWith('establishmentId');
  });
});
