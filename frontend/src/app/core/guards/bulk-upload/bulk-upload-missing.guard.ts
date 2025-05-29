import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadMissingGuard  {
  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private adminSkipService: AdminSkipService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    const primaryWorkplaceID = this.establishmentService.primaryWorkplace
      ? this.establishmentService.primaryWorkplace.uid
      : this.establishmentService.establishmentId;

    return this.bulkUploadService.getMissingRef(primaryWorkplaceID).pipe(
      map((response) => {
        if (
          response.establishmentList.some((establishment) =>
            this.adminSkipService.skippedWorkplaces.includes(establishment.uid),
          )
        ) {
          return true;
        }

        if (
          (response.establishment > 0 && this.adminSkipService.skipWorkplaceReferences !== true) ||
          response.worker > 0
        ) {
          const redirect: UrlTree = this.router.parseUrl('/bulk-upload/missing');
          return redirect;
        }

        return true;
      }),
    );
  }
}
