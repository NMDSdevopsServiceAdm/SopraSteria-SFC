import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { AdminSkipService } from '@features/bulk-upload-v2/admin-skip.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadMissingGuard implements CanActivate {
  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private adminSkipService: AdminSkipService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    const workplaceID = this.establishmentService.primaryWorkplace
      ? this.establishmentService.primaryWorkplace.uid
      : this.establishmentService.establishmentId;

    return this.bulkUploadService.getMissingRef(workplaceID).pipe(
      map((response) => {
        if (this.adminSkipService.skippedWorkplaces.includes(workplaceID)) {
          return true;
        }

        if (response.establishment > 0 || response.worker > 0) {
          const redirect: UrlTree = this.router.parseUrl('/bulk-upload/missing');
          return redirect;
        }
        return true;
      }),
    );
  }
}
