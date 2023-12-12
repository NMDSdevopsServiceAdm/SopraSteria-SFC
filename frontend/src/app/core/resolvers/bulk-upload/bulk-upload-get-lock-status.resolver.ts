import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { BulkUploadStatus } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class BulkUploadGetLockStatusResolver implements Resolve<BulkUploadStatus> {
  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private bulkUploadService: BulkUploadService,
  ) {}

  resolve(): Observable<BulkUploadStatus> {
    const establishmentId = this.establishmentService.establishmentId;

    return this.bulkUploadService.getLockStatus(establishmentId).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
