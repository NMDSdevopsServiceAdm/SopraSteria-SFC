import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { BulkUploadGetLockStatusResolver } from './bulk-upload-get-lock-status.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('BulkUploadGetLockStatusResolver', () => {
  let resolver: BulkUploadGetLockStatusResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
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
