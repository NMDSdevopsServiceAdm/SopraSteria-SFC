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
export class BulkUploadStartGuard  {
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

    return this.bulkUploadService.isFirstBulkUpload(workplaceID).pipe(
      map((response) => {
        if (this.adminSkipService.skippedWorkplaces.includes(workplaceID)) {
          return true;
        }
        if (this.adminSkipService.skipWorkplaceReferences) {
          return true;
        }
        if (response.isFirstBulkUpload) {
          const redirect: UrlTree = this.router.parseUrl('/bulk-upload/start');
          return redirect;
        }
        return true;
      }),
    );
  }
}
